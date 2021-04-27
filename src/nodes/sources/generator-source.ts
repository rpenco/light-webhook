import Joi from "joi";
import {Observable, of, Subscriber} from "rxjs";
import {AnyRecord, Record, SourceNode} from "../../api";
import {Templatizer} from "../../lib";


interface Settings {
    message: string;
    interval: number;
}

export class GeneratorSource extends SourceNode<Settings> {

    counter: number = 0;
    private handler: NodeJS.Timeout;

    /**
     * Static settings validation at startup
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
        return Joi.object({
            message: Joi.string().default("hello world!"),
            interval: Joi.number().default(1000)
        }).default();
    }

    execute(subscriber: Subscriber<AnyRecord>) {
        this.handler =setInterval(()=>{
            this.counter++;
            this.getLogger().debug(`generator execute - ${this.counter} times`);

            const record = new Record(null);
            record.setData({
                message: Templatizer.compile(this.settings().message, {id: record.id(), timestamp: record.timestamp(), counter: this.counter}),
                counter: this.counter
            });

            return subscriber.next(record)
        }, this.settings().interval);
    }

    close(): Observable<void> {
        this.getLogger().debug(`generator stop interval`);
        clearInterval(this.handler);
        return of();
    }

}
