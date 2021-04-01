import Joi from "joi";
import {of, Subscriber} from "rxjs";
import {AnyRecord, SourceNode} from "../../api";

export interface Settings{
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
export class GithubSource extends SourceNode<Settings> {

    // TODO WORK IN PROGRESS. SOURCE NOT WORK. ANY CONTRIBUTION IS WELCOME


    /**
     * Static settings validation at startup
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
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
     * Check headers and pass record to next node.
     * @param subscriber
     */

    execute(subscriber: Subscriber<AnyRecord>) {
        // TODO create Express server and listen..

        this.getLogger().info(`${this.name} execute." name="${this.name}"`);
        let req;
        // this.checkMissingWebhookEvent(req.getHeaders(), this.settings().headers.xGithubEvent);
        // this.checkAllowedEvent(req.getHeader(this.settings().headers.xGithubEvent), this.settings().events);
        // this.checkUserAgent(req.getHeaders(), 'GitHub-Hookshot/');
        this.checkGithubDelivery(req.getHeaders());
        // TODO add missing checks
        // TODO this.checkSignature(prevStream.getHeader[this.settings().headers.xGithubSignature], this.settings().signature);
        return of(req);
    }

    private checkGithubDelivery(headers: {[k: string]: string}): void {
        if (!headers['x-github-delivery']) {
            throw new Error('"x-github-delivery" header is missing.');
        }
    }
}
