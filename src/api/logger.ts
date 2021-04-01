export interface ILogger {
    debug(...args): void;

    warn(...args): void;

    info(...args): void;

    error(...args): void;

    log(level: string, ...args): void;
}