import {Observable, of, Subscriber} from "rxjs";
import * as Joi from "joi";
import {AnyRecord, INodeContext, Record, SourceNode} from "../../api";
import kafka, {Consumer, KafkaClient} from "kafka-node";

export interface Settings {
    host: string;
    topics: { topic: string, partition: number, offset: number }[];
    autoCommit: boolean;
    groupId: string;
    encoding: 'utf8' | 'buffer';
    keyEncoding: 'utf8' | 'buffer';
}

export class KafkaSource extends SourceNode<Settings> {
    private client: KafkaClient;
    private consumer: Consumer;

    validate(Joi): Joi.Schema {
        return Joi.object({
            host: Joi.string().default('127.0.0.1:9092'),
            topics: Joi.array({
                topic: Joi.string().required(),
                partition: Joi.number().default(0),
                offset: Joi.number().default(0)
            }).required(),
            autoCommit: Joi.boolean().default(true),
            groupId: Joi.string().required(),
            encoding: Joi.string().default('utf8'),
            keyEncoding: Joi.string().default('utf8')
        }).default();
    }

    prepare(context: INodeContext): Observable<boolean> {
        this.client = new kafka.KafkaClient({
            kafkaHost: this.settings().host
        });
        this.consumer = new Consumer(
            this.client,
            this.settings().topics,
            {
                autoCommit: this.settings().autoCommit,
                groupId: this.settings().groupId,
                encoding: this.settings().encoding,
                keyEncoding: this.settings().keyEncoding,
            }
        );
        return of(true);
    }

    execute(subscriber: Subscriber<AnyRecord>) {
        this.consumer.on('message', function (message) {
            const record = new Record({
                message: message
            });
            subscriber.next(record)
        });
    }

}

