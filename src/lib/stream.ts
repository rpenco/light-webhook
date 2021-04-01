import Joi from "joi";
import {forkJoin, Observable} from "rxjs";
import {map} from 'rxjs/operators';
import {TypeRegistry} from "./register";
import {INode, INodeContext, IRecord, ISinkNode, ISourceNode, NodeConfiguration, SinkNode, SourceNode} from "../api";
import {FileSource, GeneratorSource, GithubSource, GitlabSource, HttpSource} from "../nodes/sources";
import {BashSink, ConsoleSink, FileSink, HttpSink, KafkaSink, S3Sink, SyslogSink} from "../nodes/sinks";
import {Config} from "./config";
import {Log} from "./log";
import {ILogger} from "../api/logger";


export interface IStreamContext {
    logger: ILogger;
    name: string;
    nodes: NodeConfiguration[];
}

export class Stream {
    readonly context: IStreamContext;
    nodes = new Map<string, INode<any>>();
    private loopInterval: NodeJS.Timeout;
    registry = new TypeRegistry();

    constructor(context: IStreamContext) {
        this.context = context;
    }

    register() {
        //register sources
        this.registry.put('file-source', FileSource);
        this.registry.put('generator-source', GeneratorSource);
        this.registry.put('github-source', GithubSource);
        this.registry.put('gitlab-source', GitlabSource);
        this.registry.put('http-source', HttpSource);
        // this.registry.put('kafka-source', KafkaSource);
        // this.registry.put('syslog-source', SyslogSource);

        // register sinks
        this.registry.put('bash-sink', BashSink);
        this.registry.put('console-sink', ConsoleSink);
        this.registry.put('file-sink', FileSink);
        this.registry.put('http-sink', HttpSink);
        this.registry.put('kafka-sink', KafkaSink);
        this.registry.put('s3-sink', S3Sink);
        this.registry.put('syslog-sink', SyslogSink);
    }


    getLogger() {
        return this.context.logger;
    }

    /**
     * Build stream graph
     */
    public build() {
        this.getLogger().debug("loading graph...");
        this.register()
        this.context.nodes.forEach(nodeConf => {
            this.getLogger().debug(` - '${nodeConf.name}' loading...`)
            this.handleLoop(nodeConf);
        });
        this.getLogger().debug("graph successfully loaded");
        return this;
    }

    private handleLoop(nodeConf: NodeConfiguration, source?: INode<any>): INode<any> {
        this.getLogger().debug(`--> next: ${nodeConf.name}`)

        let node: INode<any> = this.nodes.get(nodeConf.name);
        if (node === undefined) {
            const nClass: any = this.registry.get(nodeConf.type);
            if (nClass === undefined) {
                throw new Error(`failed to find node type '${nodeConf.type}' for node ${nodeConf.name}. `);
            }
            node = new nClass(nodeConf, Log.getLogger().child({ node: nodeConf.name }));
            node.setSettings(Config.validate(node.validate(Joi), node.settings()));

            this.getLogger().debug(`  |_ '${nodeConf.name}' loaded`)
            this.nodes.set(node.name(), node);
        } else {
            this.getLogger().debug(`node ${nodeConf.name} already loaded`);
        }
        if (source) {
            source.addOut(node as SinkNode<any>);
        }

        if(nodeConf.out) {
            nodeConf.out.forEach(outName => {
                const outConf = this.context.nodes.find(n => n.name == outName);
                if (outConf != null) {
                    this.handleLoop(outConf, node)
                } else {
                    this.getLogger().error(`failed to find out node '${outName}' configured in out section of node ${nodeConf.name}`);
                }
            });
        }
        return node;
    }


    prepare(): Observable<boolean> {
        const context: INodeContext = {};
        this.getLogger().debug("prepare nodes...")
        const nodes = [];
        this.nodes.forEach(n => nodes.push(n));

        return forkJoin(...nodes.map(node => node.prepare(context))).pipe(map(() => {
            this.getLogger().info("all nodes are prepared.");
            return true;
        }));
    }


    public start(timeout: number): Stream {
        const sources = [];
        this.nodes.forEach(node => {
            if (node instanceof SourceNode) {
                sources.push(node);
            }
        });

        // main loop
        // TODO critical improve this graph to support unsubscribe() and resolve() / reject();
        this.loopInterval = setInterval(() => {
            this.getLogger().debug(`\n--- loop start ----`);
            const t0 = new Date().getTime();
            sources.forEach((node: ISourceNode<any>) => {
                this.getLogger().debug(`execute source node: '${node.name()}'`);
                const t1 = new Date().getTime();
                const observable = new Observable(subscriber => {
                    node.execute(subscriber)
                }).pipe(map((data: IRecord<any>) => {
                    return this.loop(node, data);
                }))

                return observable.subscribe((data) => {
                    this.getLogger().debug(`[${(new Date().getTime() - t1)} ms] execute stream final record`, data);
                });
            })
            this.getLogger().debug(`[${(new Date().getTime() - t0)} ms] --- loop end ----`);
        }, timeout);
        return this;
    }

    private loop(node: ISinkNode<any>, data: IRecord<any>) {
        node.out().forEach(out => {
            new Observable(subscriber => {
                out.execute(subscriber, data)
            }).subscribe((data2: IRecord<any>) => {
                this.loop(out, data2)
            })
        })
        return data;
    }

    /**
     * Graceful stop all nodes
     */
    public stop(): Observable<boolean> {
        this.getLogger().info("stopping stream...");
        clearInterval(this.loopInterval);
        const nodes: INode<any>[] = [];
        this.nodes.forEach(n => nodes.push(n));
        return forkJoin(...nodes.map(node => node.close())).pipe(map(() => {
            this.getLogger().info("all nodes are stopped.");
            return true;
        }));
    }
}