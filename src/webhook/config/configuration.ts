
export interface TLSConfiguration {
    enable: boolean;
    allowUnsigned: boolean;
    key: string;
    cert: string;
    passphrase: string;
}

export interface TopologyConfiguration {
    name: string;
    nodes: NodeConfiguration[];
}

export interface NodeConfiguration {
    name: string;
    type: string;
    settings: { [key: string]: any }
}

export interface LoggerConfiguration {
    level: string;
    files: {filename: string, level?: string}[];
    meta?: {[key: string]: string};
}

export interface Configuration {
    port: number;
    hostname: string;
    uploadMaxSize: number;
    tls: TLSConfiguration;
    logger: LoggerConfiguration;
    pipelines: TopologyConfiguration[];
}