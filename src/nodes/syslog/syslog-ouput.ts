import Joi from "@hapi/joi";
import {Log} from "../../webhook/lib/log";
import {Observable, of} from "rxjs";
import {ITuple} from "../../webhook/tuple/tuple";
import {INode, INodeContext} from "../../webhook/node/node";
import * as winston from "winston";
import {Templatizer} from "../../webhook/lib/templatizer";

interface Settings {
    /**
     * The host running syslogd, defaults to localhost.
     */
    host: string;

    /**
     * The port on the host that syslog is running on, defaults to syslogd's default port.
     */
    port: number;

    /**
     * The network protocol to log over (e.g. tcp4, udp4, unix, unix-connect, etc).
     */
    protocol: string;

    /**
     * The path to the syslog dgram socket (i.e. /dev/log or /var/run/syslog for OS X).
     */
    path: string;

    /**
     * PID of the process that log messages are coming from (Default process.pid).
     */
    pid: number;

    /**
     * Syslog facility to use (Default: local0).
     */
    facility: string;

    /**
     * Host to indicate that log messages are coming from (Default: localhost).
     */
    localhost: string;

    /**
     * The type of the syslog protocol to use (Default: BSD, also valid: 5424).
     */
    type: string;

    /**
     * The name of the application (Default: process.title).
     */
    app_name: string;

    /**
     * The end of line character to be added to the end of the message (Default: Message without modifications).
     */
    eol: string;

    /**
     * Syslog level to use
     */
    level: string;

    /**
     * Message template. Default is full Tuple as JSON string
     */
    message: string;
}

/**
 * // TODO Work in progress. Not tested.
 * Send a Syslog log to a Syslog server.
 * Log can be anything.
 */
export class SyslogOuputNode implements INode {
    protected readonly name: string;
    private conf: Settings;
    private logger: winston.Logger;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.schema {
        return Joi.object({
            host: Joi.string().required(),
            port: Joi.number().required(),
            protocol: Joi.string().required(),
            path: Joi.string().required(),
            pid: Joi.number(),
            facility: Joi.string(),
            localhost: Joi.string(),
            type: Joi.string(),
            app_name: Joi.string(),
            eol: Joi.string(),
            level: Joi.string().default('info'),
            message: Joi.string().default('{{tuple}}')
        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * Prepare a syslog client
     * @param conf
     * @param context
     */
    prepare(conf: Settings, context: INodeContext): Observable<ITuple<any>> {
        this.conf = conf;
        const winston = require('winston');
        this.logger = winston.createLogger({
            levels: winston.config.syslog.levels,
            transports: [
                new winston.transports.Syslog({
                    host: conf.host,
                    port: conf.port,
                    protocol: conf.protocol,
                    path: conf.path,
                    pid: conf.pid,
                    facility: conf.facility,
                    localhost: conf.localhost,
                    type: conf.type,
                    app_name: conf.app_name,
                    eol: conf.eol,
                    level: conf.level,
                })
            ]
        });
        return of();
    }

    /**
     * Called each time a new request arrived.
     * Execute syslog log then pass same tuple to next node.
     * @param tuple in this case is previous node
     */
    execute(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} receive tuple id="${tuple.getId()}"`);
        this.logger.log(this.conf.level, Templatizer.compile(this.conf.message, tuple));
        return of(tuple);
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
