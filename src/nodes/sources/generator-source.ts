import Joi from "joi";
import {Subscriber} from "rxjs";
import {AnyRecord, Record, SourceNode} from "../../api";


interface Settings {
    message: string;
}

export class GeneratorSource extends SourceNode<Settings> {

    counter: number = 0;

    /**
     * Static settings validation at startup
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
        return Joi.object({
            message: Joi.string().default("hello world!")
        }).default();
    }

    execute(subscriber: Subscriber<AnyRecord>) {
        this.counter++;
        this.getLogger().debug(`generator execute ${this.counter} times`);
        // TODO use Templatizer to allow custom template message
        subscriber.next(new Record(this.settings().message + " " + this.counter));
    }

}
