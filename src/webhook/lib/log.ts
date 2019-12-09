import * as winston from "winston";

class LogManager {
    logger;

    constructor() {
        return this.getInstance();
    }

    public getInstance(){
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            ),
            // defaultMeta: { service: 'user-service' },
            transports: [
                //
                // - Write to all logs with level `info` and below to `combined.log`
                // - Write all logs error (and below) to `error.log`.
                //
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'combined.log' })
            ]
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
        // Log.log('debug', ...args);
    }

    public warn(...args) {
        this.logger.warn(...args);
        // Log.log('warn ', ...args);
    }

    public info(...args) {
        this.logger.info(...args);
    }

    public error(...args) {
        this.logger.error(...args);
    }
}
export const Log = new LogManager();