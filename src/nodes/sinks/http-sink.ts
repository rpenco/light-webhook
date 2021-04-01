import Joi from "joi";
import {Subscriber} from "rxjs";
import * as superagent from "superagent";
import {AnyRecord, SinkNode} from "../../api";

interface Settings {
    /**
     * HTTP method
     */
    method: string;

    /**
     * Header to set
     */
    headers: { [key: string]: string };

    /**
     * Hosts to connect
     */
    hosts: string[];

    /**
     * Choose if request must be performed to all hosts (if missing or if value == hosts.length) or
     * if only 'N' will be sufficient. Can be used to load/balancing or to forward requests to many hosts at same times.
     */
    atLeast: number;

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
     *
     * Note: Your plain (clear text) provided signature will try to be encrypted using same algorithm used
     * form the received signature and will be compared.
     */
    signature: string;
}

/**
 * HttpNode is an node that sent Http requests and forward response body to the next node.
 *
 */
export class HttpSink extends SinkNode<Settings> {

    // TODO WORK IN PROGRESS. SINK NOT WORK. ANY CONTRIBUTION IS WELCOME

    /**
     * Static settings validation at startup
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
        return Joi.object({
            headers: Joi.array().default([]),
            method: Joi.string().default('post'),
            hosts: Joi.array().default([]),
            signature: Joi.string(),
            atLeast: Joi.number().default(Joi.ref('hosts').length),
        }).default();
    }


    /**
     * Called each time a new request arrived.
     * Check headers and pass record to next node.
     * @param subscriber
     * @param record
     */

    execute(subscriber: Subscriber<AnyRecord>, record: AnyRecord) {
        this.getLogger().info(`${this.name} receive record id="${record.id()}"`);
        let promises = [];
        for (const host of this.settings().hosts) {
            let request;

            if (this.settings().method === 'post') {
                request = superagent.post(`${host}`);
            } else if (this.settings().method === 'get') {
                request = superagent.post(`${host}`);
            } else if (this.settings().method === 'delete') {
                request = superagent.delete(`${host}`);
            } else if (this.settings().method === 'put') {
                request = superagent.put(`${host}`);
            } else {
                throw new Error('Invalid method for HTTP request.');
            }

            for (const header of Object.keys(this.settings().headers)) {
                request.set(this.settings().headers[header], header)
            }

            request
                .set('Content-Type', 'application/json')
                .send(record);
            promises.push(request);
        }
        // TODO enrich with reply, statuscode..
        Promise.all(promises).then(() => subscriber.next(record));
    }

}
