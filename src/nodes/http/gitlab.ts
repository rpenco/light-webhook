import {Log} from "../../webhook/lib/log";
import Joi from "@hapi/joi";
import {HttpInputNode} from "./http-input";
import {ITuple} from "../../webhook/tuple/tuple";
import {Observable, of} from "rxjs";

interface GitlabSettings {
    /**
     * HTTP method
     */
    method: string;

    /**
     * Allowed events. Can user '*' to allow all events.
     */
    events: string[];

    /**
     * Request token. Commonly is formatted like that:
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
    token: string;

    /**
     * Choose headers keys for event and signature.
     */
    headers: {
        /**
         * Event header key. No case sensitive.
         * @default
         * "x-gitlab-event"
         */
        xGitlabEvent: string;
        /**
         * Signature (token) header key. No case sensitive.
         * @default
         * "x-gitlab-signature"
         */
        xGitlabToken: string;
    };
}

/**
 * GitlabNode is an Input node that receive Gitlab Http requests and forward body to the next node.
 * This node is a specific node for the generic HttpInput node.
 *
 * As classic Input node. It is responsible to provides (if needs) the response to the client.
 * In this case:
 *
 * @code Pipeline workflow
 *  1/ Executing each execute() for each nodes in the pipeline
 *  [ GitlabNode.execute() -> OtherNode1.execute() -> OtherNodeN.execute() -> LastNode.execute() ]
 *
 *  2/ Then call automatically GitlabNode.resolve() or GitlabNode.fail() to returns response to client.
 */
export class GitlabNode extends HttpInputNode {

    constructor(name: string) {
        super(name);
    }

    /**
     * Static settings validation
     * @param Joi
     */
    public validate(Joi): Joi.schema {
        return Joi.object({
            events: Joi.array().default(['*']),
            method: Joi.string().default('post'),
            token: Joi.string().required(),
            headers: Joi.object({
                xGitlabEvent: Joi.string().default('x-gitlab-event'),
                xGitlabToken: Joi.string().default('x-gitlab-token'),
            }).default()
        }).default();
    }

    /**
     * Called each time a new request arrived.
     * Check headers and pass tuple to next node.
     * @param tuple in this case is the prepared tuple
     */
    public execute(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} receive tuple id="${tuple.getId()}"`);
        const cnf: GitlabSettings = this.conf as any;
        this.checkMissingWebhookEvent(tuple.getHeaders(), cnf.headers.xGitlabEvent);
        this.checkAllowedEvent(tuple.getHeader(cnf.headers.xGitlabEvent), cnf.events);
        // TODO add missing checks
        // TODO this.checkSignature(prevStream.getHeader[cnf.headers.xGitlabToken], cnf.token);
        return of(tuple);
    }
}
