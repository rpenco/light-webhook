import {Log} from "../../webhook/lib/log";

import Joi from "@hapi/joi";
import {INode, INodeContext} from "../../webhook/node/node";
import {Observable, of} from "rxjs";
import {ITuple} from "../../webhook/tuple/tuple";
import * as superagent from "superagent";
import {fromPromise} from "rxjs/internal/observable/fromPromise";

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
export class HttpNode implements INode {
    /**
     * User defined node name.
     */
    protected readonly name: string;

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
            headers: Joi.array().default([]),
            method: Joi.string().default('post'),
            hosts: Joi.array().default([]),
            signature: Joi.string(),
            atLeast: Joi.number().default(Joi.ref('hosts').length),
        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * TODO not called for moment
     * @param conf
     * @param context
     */
    public prepare(conf: Settings, context: INodeContext): Observable<ITuple<any>> {
        this.conf = conf;
        return of();
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
        let promises = [];
        for (const host of this.conf.hosts) {
            let request;

            if (this.conf.method === 'post') {
                request = superagent.post(`${host}`);
            } else if (this.conf.method === 'get') {
                request = superagent.post(`${host}`);
            } else if (this.conf.method === 'delete') {
                request = superagent.delete(`${host}`);
            } else if (this.conf.method === 'put') {
                request = superagent.put(`${host}`);
            } else {
                throw new Error('Invalid method for HTTP request.');
            }

            for (const header of Object.keys(this.conf.headers)) {
                request.set(this.conf.headers[header], header)
            }

            request
                .set('Content-Type', 'application/json')
                .send(tuple);
            promises.push(request);
        }
        return fromPromise(Promise.all(promises).then(() => tuple));
    }

    /**
     * Called when a node in the PIPELINE failed.
     * InputNode had responsibility to proper returns pipeline errors.
     * @param tuple is the tuple that contains transformed data during pipeline until it fails and the error.
     */
    public reject(tuple: ITuple<any>): Observable<ITuple<any>> {
        return of(tuple);
    }

    /**
     * Called when all nodes in the PIPELINE succeed.
     * InputNode had responsibility to proper returns pipeline success.
     * @param tuple is the tuple that contains transformed data during pipeline.
     */
    public resolve(tuple: ITuple<any>): Observable<ITuple<any>> {
        return of(tuple);
    }

}
