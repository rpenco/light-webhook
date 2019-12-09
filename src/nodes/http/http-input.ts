import {Log} from "../../webhook/lib/log";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

import Joi from "@hapi/joi";
import {INode, INodeContext} from "../../webhook/node/node";
import {Observable, of} from "rxjs";
import {ITuple, Tuple} from "../../webhook/tuple/tuple";

interface Settings {
    /**
     * HTTP method
     */
    method: string;

    /**
     * Allowed events. Can user '*' to allow all events.
     */
    events: string[];

    /**
     * Request signature. Commonly is formatted like that:
     * "<algorithm>=<signature>".
     *
     * You can provides generated signature
     * @example
     * "sha1=9fn20F2AO02fVZ92fd2A0ZzqzA"
     *
     * or plain text signature.
     * @example
     * "plain=hello_world"
     *
     * Received (encrypted) signature will be compared with provided signature.
     *
     * Note: Your plain (clear text) provided signature will try to be encrypted using same algorithm used
     * form the received signature and will be compared.
     */
    signature: string;

    /**
     * Choose headers keys for event and signature.
     */
    headers: {
        /**
         * Event header key. No case sensitive.
         * @default
         * "x-webhook-event"
         */
        xWebhookEvent: string;

        /**
         * Signature (token) header key. No case sensitive.
         * @default
         * "x-webhook-signature"
         */
        xWebhookSignature: string;
    };

    /**
     * Configuration for uploaded each files.
     */
    upload: {
        /**
         * Create path (directories) if not exists
         */
        mkdir: boolean;

        /**
         * Absolute output path without filename.
         */
        path: string;

        /**
         * Max upload limit
         */
        limit: string;

        /**
         * Override filename.
         * Can use templating variable like: {{file.name}} {{file.extension}}
         * @default
         * "{{file.name}}.{{file.extension}}"
         */
        filename: string;

        /**
         * Change file rights
         */
        chmod: string;

        /**
         * Change file owner
         */
        chown: string;
    };
}

/**
 * HttpInputNode is an Input node that receive Http requests and forward body, files to the next node.
 * This node is a basic generic node for custom webhook client.
 *
 * As classic Input node. It is responsible to provides (if needs) the response to the client.
 * In this case:
 *
 * @code Pipeline workflow
 *  1/ Executing each execute() for each nodes in the pipeline
 *  [ HttpInputNode.execute() -> OtherNode1.execute() -> OtherNodeN.execute() -> LastNode.execute() ]
 *
 *  2/ Then call automatically HttpInputNode.resolve() or HttpInputNode.fail() to returns response to client.
 */
export class HttpInputNode implements INode {
    /**
     * User defined node name.
     */
    protected readonly name: string;

    /**
     * Node can receives many request at same time.
     * During dealing with them,
     */
    protected requestsHandler: Map<string, any> = new Map();

    /**
     * Node configuration.
     */
    protected conf: Settings;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Static settings validation at startup
     * @param Joi
     */
    public validate(Joi): Joi.schema {
        return Joi.object({
            events: Joi.array().default(['*']),
            method: Joi.string().default('post'),
            signature: Joi.string().required(),
            headers: Joi.object({
                xWebhookEvent: Joi.string().default('x-webhook-event'),
                xWebhookSignature: Joi.string().default('x-webhook-signature'),
            }).default(),
            upload: Joi.object({
                mkdir: Joi.boolean().default(true),
                chmod: Joi.string().default(''),
                own: Joi.string().default(''),
                path: Joi.string().default(os.tmpdir()),
                limit: Joi.number().default('0'),
                filename: Joi.string().default('{{file.name}}.{{file.extension}}'),
            }).default()
        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * @param conf
     * @param context
     */
    public prepare(conf: Settings, context: INodeContext): Observable<ITuple<any>> {
        const url: string = path.join('/', context.pipeline.name, this.name);
        Log.info(`${this.name} prepare entrypoint method="${conf.method}" url="${url}"`);
        this.conf = conf;
        return new Observable(
            subscriber => {
                context.server[conf.method](url,
                    (req, res, next) => {
                        req.id = Date.now();
                        next();
                    },
                    (req, res, next) => {
                        if (req.is('multipart/*')) {
                            return this.download(req, res, next, this.conf)
                        } else {
                            Log.info(`${this.name} received application/json request id=${req.id}`);
                            return next();
                        }
                    },
                    (req, res) => {
                        this.requestsHandler.set(req.id, res);
                        subscriber.next(new Tuple<any>()
                            .setFiles(req.files)
                            .setData(req.body)
                            .setHeaders(req.headers)
                            .setId(req.id));
                    });
            }
        );
    }

    /**
     * Called when pipeline stops (when application shutdown)
     */
    public close<T>(): Observable<void> {
        // TODO interrupt running requests
        return of();
    }

    /**
     * Called each time a new request arrived.
     * Check headers and pass tuple to next node.
     * @param tuple in this case is the prepared tuple
     */
    public execute(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} receive tuple id="${tuple.getId()}"`);
        this.checkMissingWebhookEvent(tuple.getHeaders(), this.conf.headers.xWebhookEvent);
        this.checkAllowedEvent(tuple.getHeader(this.conf.headers.xWebhookEvent), this.conf.events);
        // TODO
        // this.checkSignature(prevStream.getHeader[this.conf.headers.xWebhookSignature], this.conf.signature);
        return of(tuple);
    }

    /**
     * Called when a node in the PIPELINE failed.
     * InputNode had responsibility to proper returns pipeline errors.
     * @param tuple is the tuple that contains transformed data during pipeline until it fails and the error.
     */
    public reject(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.error(`${this.name} pipeline failed id="${tuple.getId()}" error="${tuple.getError().message}"`);
        return this.requestsHandler.get(tuple.getId())
            .status(500)
            .json({error: tuple.getError().message})
    }

    /**
     * Called when all nodes in the PIPELINE succeed.
     * InputNode had responsibility to proper returns pipeline success.
     * @param tuple is the tuple that contains transformed data during pipeline.
     */
    public resolve(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} pipeline resolved id="${tuple.getId()}"`);
        return this.requestsHandler.get(tuple.getId())
            .status(200)
            .json(tuple.getData())
    }

    /**
     * Check if webhook event header is present.
     * @param headers
     * @param headerName
     */
    protected checkMissingWebhookEvent(headers: { [key: string]: string }, headerName: string): void {
        if (headers == null || !headers[headerName]) {
            throw new Error(`Header "${headerName}" is missing.`);
        }
    }

    /**
     * Check if webhook event header value is allowed.
     * @param event
     * @param allowedEvents
     */
    protected checkAllowedEvent(event: string, allowedEvents: string[]): void {
        if (allowedEvents.indexOf('*') === -1 && allowedEvents.indexOf(event) === -1) {
            throw  new Error(`Event "${event}" is not allowed.`);
        }
    }

    /**
     * Check if "User-Agent" value starts by uaPrefix.
     * @param headers headers list
     * @param uaPrefix User agent prefix
     */
    protected checkUserAgent(headers: { [key: string]: string }, uaPrefix: string): void {
        if (!headers['user-agent']) {
            throw new Error('"User-Agent" header is missing.');
        }

        if (headers['user-agent'].indexOf(uaPrefix) !== 0) {
            throw new Error('"User-Agent" not allowed.');
        }
    }


    /**
     * In case of "Content-Type: multipart/*" fields and files are extracted.
     * Each fields are placed in req.body[field].
     * Each files are uploaded according to configuration and file description (name, path, size) is available in req.files[filename].
     * @param req
     * @param res
     * @param next
     * @param conf
     */
    private download(req, res, next, conf: Settings) {
        req.files = {};
        req.busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
            Log.debug(`${this.name} received multipart request id="${req.id}" field="${fieldname}" value="${val}" encoding="${encoding}" mime="${mimetype}"`);
            req.body[fieldname] = val;
        });

        req.busboy.on('file', (fieldname, file, filename) => {
            const saveTo = path.join(conf.upload.path, filename);
            Log.info(`${this.name} starting to upload id="${req.id}" file="${fieldname}" to path="${saveTo}"...`);

            let size = 0;
            file.on('data', (data) => {
                size += data.length;
            });

            file.on('end', () => {
                Log.info(`${this.name} uploaded id="${req.id}" file="${filename}" size="${size}".`);
                req.files[fieldname] = {
                    filename: filename,
                    size: size,
                    path: saveTo
                };
            });

            file.pipe(fs.createWriteStream(saveTo));
        });

        req.busboy.on('finish', () => {
            Log.debug(`${this.name} upload files finished id="${req.id}"`);
            // TODO mkdir, chmod, chown, limit...
            next()
        });

        req.pipe(req.busboy);
    }
}
