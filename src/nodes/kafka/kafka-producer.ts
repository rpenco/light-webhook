import Joi from "@hapi/joi";
import {Log} from "../../webhook/lib/log";
import {Observable, of} from "rxjs";
import {ITuple} from "../../webhook/tuple/tuple";
import {INode, INodeContext} from "../../webhook/node/node";

interface Settings {

    /**
     * A string of kafka broker/host combination delimited by comma.
     *
     * @example
     * kafka-1.us-east-1.myapp.com:9093,kafka-2.us-east-1.myapp.com:9093,kafka-3.us-east-1.myapp.com:9093
     *
     * @default
     * localhost:9092.
     */
    hosts: string;

    /**
     * in ms it takes to wait for a successful connection before moving to the next host default: 10000
     **/
    connectTimeout: string;

    /**
     * in ms for a kafka request to timeout default: 30000
     **/
    requestTimeout: string;

    /**
     * automatically connect when KafkaClient is instantiated otherwise you need to manually call connect default: true
     **/
    autoConnect: string;

    /**
     * object hash that applies to the initial connection. see retry module for these options.
     **/
    connectRetryOptions: string;

    /**
     * allows the broker to disconnect an idle connection from a client
     * (otherwise the clients continues to O after being disconnected). The value is elapsed time in
     * ms without any data written to the TCP socket. default: 5 minutes
     **/
    idleConnection: string;

    /**
     * when the connection is closed due to client idling, client will attempt to auto-reconnect. default: true
     **/
    reconnectOnIdle: string;

    /**
     * maximum async operations at a time toward the kafka cluster. default: 10
     **/
    maxAsyncRequests: string;

    /**
     * Object, options to be passed to the tls broker sockets, ex. { rejectUnauthorized: false } (Kafka 0.9+)
     **/
    sslOptions: string;

    /**
     * Object, SASL authentication configuration (only SASL/PLAIN is currently supported),
     * ex. { mechanism: 'plain', username: 'foo', password: 'bar' } (Kafka 0.10+)
     **/
    sasl: string;

    /**
     * Configuration for when to consider a message as acknowledged
     * @default 1
     */
    requireAcks: number;

    /**
     * The amount of time in milliseconds to wait for all acks before considered
     * @default 100 (ms)
     */
    ackTimeoutMs: number;

    /**
     * Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4),
     * @default 0
     */
    partitionerType: number;

}

/**
 * // TODO Work in progress. Not tested.
 * Send a kafka message to a Kafka broker.
 * Message can be anything.
 */
export class SyslogOuputNode implements INode {
    protected readonly name: string;
    private conf: Settings;
    // private client: KafkaClient;
    // private producer: Producer;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.schema {
        return Joi.object({
            hosts: Joi.string().default('localhost:9092'),
            connectTimeout: Joi.number().default(10000),
            requestTimeout: Joi.number().default(30000),
            autoConnect: Joi.boolean().default(true),
            connectRetryOptions: Joi.object(),
            idleConnection: Joi.number(),
            reconnectOnIdle: Joi.number().default(true),
            maxAsyncRequests: Joi.number().default(10),
            sslOptions: Joi.object(),
            sasl: Joi.object(),
            requireAcks: Joi.number().default(1),
            ackTimeoutMs: Joi.number().default(100),
            partitionerType: Joi.number().default(2),
        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * Prepare a syslog client
     * @param conf
     * @param context
     */
    prepare(conf: Settings, context: INodeContext): Observable<ITuple<any>> {
        this.conf = conf;
        // this.client = new KafkaClient({
        //     kafkaHost: this.conf.hosts,
        //     connectTimeout: this.conf.connectTimeout,
        //     requestTimeout: this.conf.requestTimeout,
        //     autoConnect: this.conf.autoConnect,
        //     connectRetryOptions: this.conf.connectRetryOptions,
        //     idleConnection: this.conf.idleConnection,
        //     reconnectOnIdle: this.conf.reconnectOnIdle,
        //     maxAsyncRequests: this.conf.maxAsyncRequests,
        //     sslOptions: this.conf.sslOptions,
        //     sasl: this.conf.sasl,
        // });
        //
        // this.producer = new Producer(this.client, {
        //     requireAcks: this.conf.requireAcks,
        //     ackTimeoutMs: this.conf.ackTimeoutMs,
        //     partitionerType: this.conf.partitionerType
        // });

        // return new Observable(
        //     observer => this.producer.on('ready', () => {
        //         observer.next()
        //     })
        // );
        return of();
    }

    /**
     * Called each time a new request arrived.
     * Execute syslog log then pass same tuple to next node.
     * @param tuple in this case is previous node
     */
    execute(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} receive tuple id="${tuple.getId()}"`);

        // return new Observable(
        //     observer => this.producer.send({
        //         topic: 'topicName',
        //         messages: ['message body'], // multi messages should be a array, single message can be just a string or a KeyedMessage instance
        //         key: 'theKey', // string or buffer, only needed when using keyed partitioner
        //         partition: 0, // default 0
        //         attributes: 2, // default: 0
        //         timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10+)
        //     }, () => {
        //         observer.next();
        //     })
        // );
        return of();
    }

    /**
     * Called when pipeline stops (when application shutdown)
     * TODO for moment close() is only called on InputNode
     */
    close<T>(): Observable<void> {
        // TODO interrupt running requests
        return of();
    }

    /**
     * Called when a node in the PIPELINE failed.
     * TODO for moment reject() is only called on InputNode
     */
    reject<A, B>(lastStream: ITuple<A>): Observable<ITuple<B>> {
        return of();
    }

    /**
     * Called when a node in the PIPELINE succeed.
     * TODO for moment resolve() is only called on InputNode
     */
    resolve<A, B>(lastStream: ITuple<A>): Observable<ITuple<B>> {
        return of();
    }
}
