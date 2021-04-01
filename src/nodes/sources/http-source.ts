import * as path from "path";
import * as fs from "fs";
import * as os from "os";

import Joi from "joi";
import {Observable, of, Subscriber} from "rxjs";
import {CST} from "yaml";
import {AnyRecord, INodeContext, Record, SourceNode} from "../../api";
import * as http from "http";
import express, {Express} from "express";
import {VoidRecord} from "../../api/record";

export interface HttpSourceSettings {

    host: string;

    port: number;

    /**
     * HTTP method
     */
    method: string;

    /**
     * HTTP path
     */
    path: string;

    /**
     * Webhook support settings
     */
    webhook: WebhookSettings

    /**
     * Configuration for uploaded each files.
     */
    multipart: MultipartSettings;
}

interface WebhookSettings{

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
        event: string;

        /**
         * Signature (token) header key. No case sensitive.
         * @default
         * "x-webhook-token"
         */
        token: string;
    };
}

interface MultipartSettings{
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
}


/**
 * HttpInputNode is an Input node that receive Http requests and forward body, files to the next node.
 * This node is a basic generic node for custom lib client.
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
export class HttpSource extends SourceNode<HttpSourceSettings> {

    // TODO WORK IN PROGRESS. SOURCE NOT WORK. ANY CONTRIBUTION IS WELCOME


    /**
     * Node can receives many request at same time.
     * During dealing with them,
     */
    private requestsHandler: any[] = [];
    private app: Express;
    private server: http.Server;

    /**
     * Static settings validation at startup
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
        return Joi.object({
            /**
             * Server configuration
             */
            host: Joi.string().default('127.0.0.1'),
            port: Joi.number().default(80),
            method: Joi.string().default('post'),
            path: Joi.string().default('/'),

            /**
             * Webhook support
             */
            webhook: Joi.object({
                events: Joi.array().default(['*']),
                signature: Joi.string(),
                headers: Joi.object({
                    event: Joi.string().default('x-webhook-event'),
                    token: Joi.string().default('x-webhook-token'),
                }).default(),
            }),

            /**
             * TODO Authorization support
             */
            authorization: Joi.object({
                header: Joi.string().default('authorization'),
            }),

            /**
             * TODO TLS support
             */
            tls: Joi.object({
                key: Joi.string(),
                cert: Joi.string(),
                passphrase: Joi.string(),
            }),

            /**
             * TODO multipart support
             */
            multipart: Joi.object({
                mkdir: Joi.boolean().default(true),
                chmod: Joi.string().default(''),
                owner: Joi.string().default(''),
                path: Joi.string().default(os.tmpdir()),
                maxSize: Joi.number().default('1_000_000'),
                filename: Joi.string().default('{{file.name}}.{{file.extension}}'),
            })

        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * @param conf
     * @param context
     */
    prepare(context: INodeContext): Observable<VoidRecord> {
        this.getLogger().info(`prepare server host: "${this.settings().host}", port: "${this.settings().port}"`);

        this.app = express();
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(express.json());
        this.server = this.app.listen(this.settings().port);

        this.app[this.settings().method](this.settings().path, (req, res) => {
            try{
                // support webhook
                if(this.settings().webhook){
                    this.checkMissingWebhookEvent(req.headers, this.settings().webhook.headers.event);
                    this.checkAllowedEvent(req.headers[this.settings().webhook.headers.event], this.settings().webhook.events);

                    // TODO
                    // this.checkSignature(req.getHeaders[this.settings().headers.xWebhookSignature], this.settings().signature);

                    // TODO
                    // this.checkUserAgent(req.getHeaders, this.settings().uaPrefix);
                }

                // TODO support multipart
                // if (req.is('multipart/*')) {
                //         return this.download(req, res, next, this.settings())
                // }

            }catch (e){
                this.getLogger().error(`requests contains error, event skipped. ${e.message}`);
                res.json({"status": 500, "reason": e.message});
                return;
            }

            this.requestsHandler.push(req);
            res.json({
                "status": 200
            });
        })

        return of(new VoidRecord());
    }


    /**
     * Called each time a new request arrived.
     * Check headers and pass record to next node.
     * @param subscriber
     */
    execute(subscriber: Subscriber<AnyRecord>) {
        this.getLogger().debug(`execute requests: ${this.requestsHandler.length}`);
        if(this.requestsHandler.length > 0){
            const req = this.requestsHandler.shift();
            subscriber.next(new Record({
                url: req.url,
                method: req.method,
                headers: req.headers,
                body: req.body
            }));
        }
    }



    close(): Observable<void> {
        this.getLogger().info(`close server host: "${this.settings().host}", port: "${this.settings().port}"`);
        this.server.close();
        return of();
    }

    /**
     * Called when a node in the PIPELINE failed.
     * InputNode had responsibility to proper returns pipeline errors.
     * @param record is the record that contains transformed data during pipeline until it fails and the error.
     */
    public reject(record: AnyRecord): Observable<AnyRecord> {
        // this.getLogger().error(`${this.name} pipeline failed id="${record.id()}" error="${record.getError().message}"`);
        // return this.requestsHandler.get(record.getId())
        //     .status(500)
        //     .json({error: record.getError().message})
        return of();
    }

    /**
     * Called when all nodes in the PIPELINE succeed.
     * InputNode had responsibility to proper returns pipeline success.
     * @param record is the record that contains transformed data during pipeline.
     */
    public resolve(record: AnyRecord): Observable<AnyRecord> {
        this.getLogger().info(`${this.name} pipeline resolved id="${record.id()}"`);
        // return this.requestsHandler.get(record.getId())
        //     .status(200)
        //     .json(record.getData())
        return of();
    }

    /**
     * Check if webhook event header is present.
     * @param headers
     * @param headerName
     */
    protected checkMissingWebhookEvent(headers: { [key: string]: string }, headerName: string): void {
        if (headers == null || !headers[headerName]) {
            throw new Error(`Header '${headerName}' is missing.`);
        }
    }

    /**
     * Check if webhook event header value is allowed.
     * @param event
     * @param allowedEvents
     */
    protected checkAllowedEvent(event: string, allowedEvents: string[]): void {
        if (allowedEvents.indexOf('*') === -1 && allowedEvents.indexOf(event) === -1) {
            throw  new Error(`Event '${event}' is not allowed.`);
        }
    }

    /**
     * Check if "User-Agent" value starts by uaPrefix.
     * @param headers headers list
     * @param uaPrefix User agent prefix
     */
    protected checkUserAgent(headers: { [key: string]: string }, uaPrefix: string): void {
        if (!headers['user-agent']) {
            throw new Error('User-Agent header is missing.');
        }

        if (headers['user-agent'].indexOf(uaPrefix) !== 0) {
            throw new Error('User-Agent header not allowed.');
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
    private download(req, res, next, conf: HttpSourceSettings) {
        req.files = {};
        req.busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
            this.getLogger().debug(`${this.name} received multipart request id="${req.id}" field="${fieldname}" value="${val}" encoding="${encoding}" mime="${mimetype}"`);
            req.body[fieldname] = val;
        });

        req.busboy.on('file', (fieldname, file, filename) => {
            const saveTo = path.join(conf.multipart.path, filename);
            this.getLogger().info(`${this.name} starting to upload id="${req.id}" file="${fieldname}" to path="${saveTo}"...`);

            let size = 0;
            file.on('data', (data) => {
                size += data.length;
            });

            file.on('end', () => {
                this.getLogger().info(`${this.name} uploaded id="${req.id}" file="${filename}" size="${size}".`);
                req.files[fieldname] = {
                    filename: filename,
                    size: size,
                    path: saveTo
                };
            });

            file.pipe(fs.createWriteStream(saveTo));
        });

        req.busboy.on('finish', () => {
            this.getLogger().debug(`${this.name} upload files finished id="${req.id}"`);
            // TODO mkdir, chmod, chown, limit...
            next()
        });

        req.pipe(req.busboy);
    }
}
