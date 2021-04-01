import Joi from "joi";
import {Observable, of, Subscriber} from "rxjs";
import * as winston from "winston";
import {INodeContext, IRecord, SinkNode} from "../../api";
import {Templatizer} from "../../lib";

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
     * Message template. Default is full Record as JSON string
     */
    message: string;
}

export class SyslogSink extends SinkNode<Settings> {

    // TODO WORK IN PROGRESS. SINK NOT WORK. ANY CONTRIBUTION IS WELCOME
    
    private logger: winston.Logger;

    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
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
            message: Joi.string().default('{{record}}')
        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * Prepare a syslog client
     * @param conf
     * @param context
     */
    prepare(context: INodeContext): Observable<IRecord<any>> {
        const winston = require('winston');
        this.logger = winston.createLogger({
            levels: winston.config.syslog.levels,
            transports: [
                new winston.transports.Syslog({
                    host: this.settings().host,
                    port: this.settings().port,
                    protocol: this.settings().protocol,
                    path: this.settings().path,
                    pid: this.settings().pid,
                    facility: this.settings().facility,
                    localhost: this.settings().localhost,
                    type: this.settings().type,
                    app_name: this.settings().app_name,
                    eol: this.settings().eol,
                    level: this.settings().level,
                })
            ]
        });
        return of();
    }

    execute(subscriber: Subscriber<IRecord<any>>, record: IRecord<any>) {
        this.logger.log(this.settings().level, Templatizer.compile(this.settings().message, record));
    }
}
