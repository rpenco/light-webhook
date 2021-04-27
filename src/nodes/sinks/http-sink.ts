import Joi from "joi";
import {Observable} from "rxjs";
import * as superagent from "superagent";
import {AnyRecord, SinkNode} from "../../api";
import {fromPromise} from "rxjs/internal/observable/fromPromise";
import {Templatizer} from "../../lib";
import {SuperAgentRequest} from "superagent";

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
     * Url
     */
    url: string;

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

    /**
     * Body template
     */
    body: string;
}

/**
 * HttpNode is an node that sent Http requests and forward response body to the next node.
 *
 */
export class HttpSink extends SinkNode<Settings> {

    public validate(Joi): Joi.Schema {
        return Joi.object({
            url: Joi.sting().required(),
            method: Joi.string().default('post'),
            headers: Joi.array().default([]),
            body: Joi.string().default("{{stringify(it)}}"),
        }).default();
    }


    /**
     * Called each time a new request arrived.
     * Check headers and pass record to next node.
     * @param record
     */
    execute(record: AnyRecord):Observable<AnyRecord> {
        this.getLogger().info(`${this.name} receive record id="${record.id()}"`);

        let request:SuperAgentRequest;

        if (this.settings().method === 'post') {
            request = superagent.post(`${this.settings().url}`);
        } else if (this.settings().method === 'get') {
            request = superagent.post(`${this.settings().url}`);
        } else if (this.settings().method === 'delete') {
            request = superagent.delete(`${this.settings().url}`);
        } else if (this.settings().method === 'put') {
            request = superagent.put(`${this.settings().url}`);
        } else {
            throw new Error('Invalid method for HTTP request.');
        }

        for (const header of Object.keys(this.settings().headers)) {
            request.set(
                Templatizer.compile(this.settings().headers[header], {...record.data()}),
                Templatizer.compile(header, {...record.data()}))
        }

        return fromPromise(request.send(Templatizer.compile(this.settings().body, {...record.data()})).then(value => {
            record.setData({...record.data(), response: value})
            return record;
        }));
    }

}
