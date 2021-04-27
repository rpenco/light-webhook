import Joi from "joi";
import {Observable, of, Subscriber} from "rxjs";
import {AnyRecord, SourceNode} from "../../api";

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
export class GitlabSource extends SourceNode<GitlabSettings> {

    // TODO WORK IN PROGRESS. SOURCE NOT WORK. ANY CONTRIBUTION IS WELCOME

    /**
     * Static settings validation
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
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

    execute():Observable<AnyRecord> {
        // TODO create Express server and listen..
        let req;
        this.getLogger().info(`${this.name} receive record id="${req.getId()}"`);
        // this.checkMissingWebhookEvent(req.getHeaders(), cnf.headers.xGitlabEvent);
        // this.checkAllowedEvent(req.getHeader(cnf.headers.xGitlabEvent), cnf.events);
        // TODO add missing checks
        // TODO this.checkSignature(prevStream.getHeader[cnf.headers.xGitlabToken], cnf.token);
        return of(req);
    }
}
