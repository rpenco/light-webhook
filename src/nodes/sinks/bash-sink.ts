import Joi from "joi";
import {Subscriber} from "rxjs";
import {AnyRecord, SinkNode} from "../../api";
import {SubprocessBuilder, Templatizer} from "../../lib";

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
 * This node is not an InputNode. As any not InputNode it has only responsibility to receive a Record from previous node,
 * perform his bash command and forward a Record. Forwarded Record can be modified/transformed if need.
 */
export class BashSink extends SinkNode<Settings> {
    private builder: SubprocessBuilder;

    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
        return Joi.object({
            pwd: Joi.string(),
            command: Joi.string().required(),
            arguments: Joi.array().default([]),
            environments: Joi.array().default([])
        }).default();
    }

    /**
     * Called each time a new request arrived.
     * Execute bash command then pass output to a new record to next node.
     * @param subscriber
     * @param record
     */
    execute(subscriber: Subscriber<AnyRecord>, record: AnyRecord): void {
        this.getLogger().info(`${this.name()} receive record id="${record.id()}"`);

        this.builder = new SubprocessBuilder()
            .command(Templatizer.compile(this.settings().command, record))
            .arguments(this.settings().arguments.map(arg => Templatizer.compile(arg, record)));

        if (this.settings().pwd) {
            this.builder.pwd(Templatizer.compile(this.settings().pwd, record))
        }

        if (this.settings().environments) {
            this.builder.environments(this.settings().environments.map(env => Templatizer.compile(env, record)))
        }

        this.builder.execute()
            .then(data => {
                    record.setData({...record.data(), stdout: data.stdout, stderr: data.stderr, code: data.code});
                    subscriber.next(record)
                },
                err => {
                    // record.setError(new Error(`Command returns an error status code.`));
                    record.setData({...record.data(), stdout: '', stderr: err, code: 255});
                    subscriber.error(record);
                }
            )
    }

}
