import {Configuration, TopologyConfiguration} from "./configuration";
import {Pipeline} from "../pipeline/pipeline";
import {Config} from "./config";

export class ConfigurationBuilder {
    port: number = 8111;
    hostname: string = '127.0.0.1';
    pipelines: TopologyConfiguration[] = [];

    setHostname(hostname: string): ConfigurationBuilder {
        this.hostname = hostname;
        return this
    }

    setPort(port: number): ConfigurationBuilder {
        this.port = port;
        return this
    }

    addPipeline(pipeline: TopologyConfiguration): ConfigurationBuilder {
        this.pipelines.push(pipeline);
        return this
    }

    public build(): Configuration {
        return Config.validate({
            hostname: this.hostname,
            pipelines: this.pipelines,
            port: this.port,
            tls: undefined,
            uploadMaxSize: 0
        })
    }
}