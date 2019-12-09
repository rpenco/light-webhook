import {SubProcessBuilder} from "../../webhook/lib/SubProcessBuilder";
import Joi from "@hapi/joi";
import {Log} from "../../webhook/lib/log";
import {fromPromise} from "rxjs/internal/observable/fromPromise";
import {Observable, of} from "rxjs";
import {ITuple} from "../../webhook/tuple/tuple";
import {INode, INodeContext} from "../../webhook/node/node";

interface Settings {
    /**
     * Working directory.
     */
    pwd: string;

    /**
     * Command to execute. Without any arguments
     */
    command: string;

    /**
     * Command arguments
     */
    arguments: string[];

    /**
     * Set environment variables.
     * Format: 'key="value"'
     */
    environments: string[];

    /**
     * If true, display JSON as string else try to get nested value
     * @default false
     * @example
     * if obj  is { a: { b: 1}} and string is "{{a}}"
     *
     * if stringify === true will display:
     *   '{"b": 1}'
     * else if stringify === false will display:
     *  '[object]' and you 'll need to set "{{a.b}}" to display '1'
     */
    stringify: boolean;
}

/**
 * Execute a Bash/Shell command.
 * Command can be anything.
 * This node is not an InputNode. As any not InputNode it has only responsibility to receive a Tuple from previous node,
 * perform his bash command and forward a Tuple. Forwarded Tuple can be modified/transformed if need.
 */
export class BashNode implements INode {
    protected readonly name: string;
    private builder: SubProcessBuilder;
    private conf: Settings;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.schema {
        return Joi.object({
            pwd: Joi.string(),
            command: Joi.string().required(),
            arguments: Joi.array().default([]),
            environments: Joi.array().default([]),
            stringify: Joi.boolean().default(false)
        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * TODO for moment prepare() is only called on InputNode
     * @param conf
     * @param context
     */
    prepare(conf: Settings, context: INodeContext): Observable<ITuple<any>> {
        this.conf = conf;
        // nothing to do. return non breaking observable..
        return of();
    }

    /**
     * Called each time a new request arrived.
     * Execute bash command then pass output to a new tuple to next node.
     * @param tuple in this case is previous node
     */
    execute(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} receive tuple id="${tuple.getId()}"`);

        // const {stringify, command, arguments} = this.getSettings();
        // const execCmd = Templatizer(arguments.map((arg) => arg).join(' '), event, {stringify: stringify});

        this.builder = new SubProcessBuilder()
            .command(this.conf.command)
            .arguments(this.conf.arguments);

        if (this.conf.pwd) {
            this.builder.pwd(this.conf.pwd)
        }

        if (this.conf.environments) {
            this.builder.environments(this.conf.environments)
        }

        return fromPromise(this.builder.execute().then((data) => tuple.setData(data)));
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
