import Joi from "joi";
import {Observable, of, Subscriber} from "rxjs";
import {AnyRecord, SinkNode} from "../../api";

/**
 * Node setting
 */
interface Settings {
    format: 'json' | 'pretty-json' | 'plain';
    level: 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';
    prefix: string;
    passThrough: boolean;
}

export class ConsoleSink extends SinkNode<Settings> {

    public validate(Joi): Joi.Schema {
        return Joi.object({
            format: Joi.string().default('json'),
            level: Joi.string().default('info'),
            prefix: Joi.string().default(this.name() + '>'),
            passThrough: Joi.boolean().default(true)
        }).default();
    }

    execute(record: AnyRecord): Observable<AnyRecord> {
        this.getLogger().debug(`id: ${record.id()} flow: ${record.flow().join('-->')} `)//data: ${JSON.stringify(recordCopy.data())}

        let log;
        switch (this.settings().format) {
            case "json":
                log = `${this.settings().prefix} ${this.getAsJson(record)}`;
                break;
            case "pretty-json":
                log = `${this.settings().prefix} ${this.getAsJson(record, true)}`;
                break;
            case "plain":
            default:
                log = `${this.settings().prefix} ${this.getAsPlainText(record)}`
        }

        //get winston child logger to remove extra logs
        this.getLogger().log(this.settings().level, log);

        // update data if required
        if (this.settings().passThrough === false) {
            record.setData({...record.data(), console: log})
        }

        return of(record);
    }

    getAsJson(record: AnyRecord, pretty?: boolean): string {
        return pretty? `${JSON.stringify(record.data(), null, 2)}` : `${JSON.stringify(record.data())}`;
    }

    getAsPlainText(record: AnyRecord): string {
        return `${record.data()}`
    }
 
}
