import {Subscriber} from "rxjs";
import * as Joi from "joi";
import {IRecord, Record, SourceNode} from "../../api";

export interface Settings{
    path: string;
    pattern: string;
    maxSize: number;
    load: boolean;
}

export class FileSource extends SourceNode<Settings> {
    // TODO WORK IN PROGRESS. SINK NOT WORK. ANY CONTRIBUTION IS WELCOME

    execute(subscriber: Subscriber<IRecord<any>>) {
        subscriber.next(new Record(null))
    }

    validate(Joi): Joi.Schema {
        return Joi.object({
            path: Joi.string().required(),
            pattern: Joi.string().default('.*'),
            maxSize: Joi.number().default(1_000_000),
            load: Joi.boolean().default(true)
        }).default();
    }

}

