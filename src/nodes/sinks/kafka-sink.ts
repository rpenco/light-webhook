import Joi from "joi";
import {Observable, of, Subscriber} from "rxjs";
import {AnyRecord, INodeContext, SinkNode} from "../../api";

interface Settings {
    host: string;
    topic: string;
    partition: number;
}

/**
 * Send a kafka message to a Kafka broker.
 */
export class KafkaSink extends SinkNode<Settings> {

    // TODO WORK IN PROGRESS. SINK NOT WORK. ANY CONTRIBUTION IS WELCOME

    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
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

    prepare(context: INodeContext): Observable<AnyRecord> {
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
        return of(null);
    }
        execute(subscriber: Subscriber<AnyRecord>, record: AnyRecord) {
            this.getLogger().info(`${this.name} receive record id="${record.id()}"`);

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
}
