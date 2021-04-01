
export interface TLSConfiguration {
    enable: boolean;
    allowUnsigned: boolean;
    key: string;
    cert: string;
    passphrase: string;
}

export type StreamConfiguration = NodeConfiguration[];

export interface NodeConfiguration {
    name: string;
    type: string;
    settings: { [key: string]: any }
    out?: string[]
}

export interface LoggerConfiguration {
    level: string;
    files: {filename: string, level?: string}[];
    meta?: {[key: string]: string};
}

export interface Configuration {
    /**
     * @deprecated
     */
    port: number;
    /**
     * @deprecated
     */
    hostname: string;
    /**
     * @deprecated
     */
    uploadMaxSize: number;
    /**
     * @deprecated
     */
    tls: TLSConfiguration;

    logger: LoggerConfiguration;

    name: string;
    interval: number;
    stream: StreamConfiguration;
}