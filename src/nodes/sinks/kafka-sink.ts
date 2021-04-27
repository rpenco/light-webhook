import Joi from "joi";
import {HighLevelProducer, KafkaClient, Producer } from "kafka-node";
import {Observable, of, Subscriber} from "rxjs";
import {AnyRecord, INodeContext, SinkNode} from "../../api";
import {Templatizer} from "../../lib";

interface Settings {
    host: string;
    topic: string;
    message: string;
    key: string;
    partition: string;
}

/**
 * Send a kafka message to a Kafka broker.
 */
export class KafkaSink extends SinkNode<Settings> {
    private client: KafkaClient;
    private producer: HighLevelProducer;


    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
        return Joi.object({
            host: Joi.string().default('localhost:9092'),
            topic: Joi.string().required(),
            message: Joi.string().default('{{stringify(it)}}'),
            key: Joi.string().required(),
            partition: Joi.string().default('0'),
            // connectTimeout: Joi.number().default(10000),
            // requestTimeout: Joi.number().default(30000),
            // autoConnect: Joi.boolean().default(true),
            // connectRetryOptions: Joi.object(),
            // idleConnection: Joi.number(),
            // reconnectOnIdle: Joi.number().default(true),
            // maxAsyncRequests: Joi.number().default(10),
            // sslOptions: Joi.object(),
            // sasl: Joi.object(),
            // requireAcks: Joi.number().default(1),
            // ackTimeoutMs: Joi.number().default(100),
            // partitionerType: Joi.number().default(2),
        }).default();
    }

    prepare(context: INodeContext): Observable<boolean> {
        this.client = new KafkaClient({
            kafkaHost: this.settings().host,
            // connectTimeout: this.settings().connectTimeout,
            // requestTimeout: this.settings().requestTimeout,
            // autoConnect: this.settings().autoConnect,
            // connectRetryOptions: this.settings().connectRetryOptions,
            // idleConnection: this.settings().idleConnection,
            // reconnectOnIdle: this.settings().reconnectOnIdle,
            // maxAsyncRequests: this.settings().maxAsyncRequests,
            // sslOptions: this.settings().sslOptions,
            // sasl: this.settings().sasl,
        });

        this.producer = new HighLevelProducer(this.client);

        return new Observable<boolean>(subscriber => {
            this.producer.on('ready',  () => {
                subscriber.next(true);
            });
        });
    }
        execute(record: AnyRecord):Observable<AnyRecord> {
            this.getLogger().info(`emit record to kafka id="${record.id()}"`);

            let payloads: any = {
                topic: Templatizer.compile(this.settings().topic, {...record.data()}),
                messages: Templatizer.compile(this.settings().message, {...record.data()}), // multi messages should be a array, single message can be just a string or a KeyedMessage instance
                key: Templatizer.compile(this.settings().key, {...record.data()}), // string or buffer, only needed when using keyed partitioner
                partition: Templatizer.compile(this.settings().partition, {...record.data()}) , // default 0
                timestamp: Date.now() // <-- defaults to Date.now() (only available with kafka v0.10+)
            };

            return new Observable(
                subscriber => {
                    this.producer.send(payloads, () => {
                        subscriber.next();
                    });
                }
            );
        }
}
