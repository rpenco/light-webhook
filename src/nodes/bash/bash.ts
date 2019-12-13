import {SubProcessBuilder} from "../../webhook/lib/SubProcessBuilder";
import Joi from "@hapi/joi";
import {Log} from "../../webhook/lib/log";
import {fromPromise} from "rxjs/internal/observable/fromPromise";
import {Observable, of} from "rxjs";
import {ITuple} from "../../webhook/tuple/tuple";
import {INode, INodeContext} from "../../webhook/node/node";
import {Templatizer} from "../../webhook/lib/templatizer";

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
            environments: Joi.array().default([])
        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * @param conf
     * @param context
     */
    prepare(conf: Settings, context: INodeContext): Observable<ITuple<any>> {
        this.conf = conf;
        Log.debug(`prepare ${this.name} node. nothing to do. return non breaking observable..`);
        return of();
    }

    /**
     * Called each time a new request arrived.
     * Execute bash command then pass output to a new tuple to next node.
     * @param tuple in this case is previous node
     */
    execute(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} receive tuple id="${tuple.getId()}"`);

        this.builder = new SubProcessBuilder()
            .command(Templatizer.compile(this.conf.command, tuple))
            .arguments(this.conf.arguments.map(arg => Templatizer.compile(arg, tuple)));

        if (this.conf.pwd) {
            this.builder.pwd(Templatizer.compile(this.conf.pwd, tuple))
        }

        if (this.conf.environments) {
            this.builder.environments(this.conf.environments.map(env => Templatizer.compile(env, tuple)))
        }

        return fromPromise(this.builder.execute()
            .then(
                data => tuple.setData(data),
                err => {
                    tuple.setError(new Error(`Command returns an error status code.`));
                    tuple.setData({stdout: '', stderr: err});
                    return Promise.reject(tuple);
                }
            ));
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
