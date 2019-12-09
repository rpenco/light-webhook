import {HttpInputNode} from "./http-input";
import Joi from "@hapi/joi";
import {ITuple} from "../../webhook/tuple/tuple";
import {Observable, of} from "rxjs";
import {Log} from "../../webhook/lib/log";

interface GithubSettings {
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
         * "x-github-event"
         */
        xGithubEvent: string;
        /**
         * Signature (token) header key. No case sensitive.
         * @default
         * "x-github-signature"
         */
        xGithubSignature: string;
    };
}


/**
 * GithubNode is an Input node that receive Github Http requests and forward body to the next node.
 * This node is a specific node for the generic HttpInput node.
 *
 * As classic Input node. It is responsible to provides (if needs) the response to the client.
 * In this case:
 *
 * @code Pipeline workflow
 *  1/ Executing each execute() for each nodes in the pipeline
 *  [ GithubNode.execute() -> OtherNode1.execute() -> OtherNodeN.execute() -> LastNode.execute() ]
 *
 *  2/ Then call automatically GithubNode.resolve() or GithubNode.fail() to returns response to client.
 */
export class GithubNode extends HttpInputNode {

    constructor(name: string) {
        super(name);
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
                xGithubEvent: Joi.string().default('x-github-event'),
                xGithubSignature: Joi.string().default('x-hub-signature'),
            }).default()
        }).default();
    }


    /**
     * Called each time a new request arrived.
     * Check headers and pass tuple to next node.
     * @param tuple in this case is the prepared tuple
     */
    execute(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} execute." name="${this.name}"`);
        const cnf: GithubSettings = this.conf as any;
        this.checkMissingWebhookEvent(tuple.getHeaders(), cnf.headers.xGithubEvent);
        this.checkAllowedEvent(tuple.getHeader(cnf.headers.xGithubEvent), cnf.events);
        this.checkUserAgent(tuple.getHeaders(), 'GitHub-Hookshot/');
        this.checkGithubDelivery(tuple.getHeaders());
        // TODO add missing checks
        // TODO this.checkSignature(prevStream.getHeader[cnf.headers.xGithubSignature], cnf.signature);
        return of(tuple);
    }

    private checkGithubDelivery(headers: {[k: string]: string}): void {
        if (!headers['x-github-delivery']) {
            throw new Error('"x-github-delivery" header is missing.');
        }
    }
}
