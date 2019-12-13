import * as winston from "winston";
import {LoggerConfiguration} from "../config/configuration";

class LogManager {
    logger;

    constructor() {
        return this.getInstance({
            level: 'info',
            meta: {
                service: 'local'
            },
            files: [
                {filename: 'error.log', level: 'error'},
                {filename: 'combined.log'}
            ]
        });
    }

    public getInstance(configuration: LoggerConfiguration) {
        this.logger = winston.createLogger({
            level: configuration.level,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
            defaultMeta: configuration.meta,
            transports: configuration.files.map(file => new winston.transports.File(file))
        });

        if (process.env.NODE_ENV !== 'production') {
            this.logger.level = 'debug';
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            }));
        }
        return this;
    }

    public debug(...args) {
        this.logger.debug(...args);
    }

    public warn(...args) {
        this.logger.warn(...args);
    }

    public info(...args) {
        this.logger.info(...args);
    }

    public error(...args) {
        this.logger.error(...args);
    }

    reload(configuration: LoggerConfiguration) {
        this.getInstance(configuration);
    }
}

export const Log = new LogManager();