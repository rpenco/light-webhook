import Joi from "joi";
import {forkJoin, Observable, pipe} from "rxjs";
import {flatMap, map, mergeAll, multicast} from 'rxjs/operators';
import {Type, TypeRegistry} from "./register";
import {
    INode,
    INodeContext,
    IRecord,
    ISinkNode,
    ISourceNode,
    NodeConfiguration,
    Record,
    SinkNode,
    SourceNode
} from "../api";
import {FileSource, GeneratorSource, GithubSource, GitlabSource, HttpSource} from "../nodes/sources";
import {BashSink, ConsoleSink, FileSink, HttpSink, KafkaSink, S3Sink, SyslogSink} from "../nodes/sinks";
import {Config} from "./config";
import {Log} from "./log";
import {ILogger} from "../api/logger";
import {CST} from "yaml";
import Map = CST.Map;


export interface IStreamContext {
    logger: ILogger;
    name: string;
    nodes: NodeConfiguration[];
}

type SourceObs = { source: ISourceNode<any>, observable: Observable<IRecord<any>> };


export class Stream {
    readonly context: IStreamContext;
    nodes = new Map<string, INode<any>>();
    private loopInterval: NodeJS.Timeout;
    registry = new TypeRegistry();
    stream: any[] = [];
    constructor(context: IStreamContext) {
        this.context = context;
    }

    register() {
        //register sources
        // this.registry.put('file-source', FileSource);
        this.registry.putSource('generator-source', GeneratorSource);
        // this.registry.put('github-source', GithubSource);
        // this.registry.put('gitlab-source', GitlabSource);
        this.registry.putSource('http-source', HttpSource);
        // this.registry.put('kafka-source', KafkaSource);
        // this.registry.put('syslog-source', SyslogSource);

        // register sinks
        // this.registry.put('bash-sink', BashSink);
        this.registry.putSink('console-sink', ConsoleSink);
        // this.registry.put('file-sink', FileSink);
        // this.registry.put('http-sink', HttpSink);
        // this.registry.put('kafka-sink', KafkaSink);
        // this.registry.put('s3-sink', S3Sink);
        // this.registry.put('syslog-sink', SyslogSink);
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
            let nClass: any = this.registry.getSource(nodeConf.type);
            let node;
            if(nClass){
                node = new nClass(nodeConf, Log.getLogger().child({node: nodeConf.name}));
                node.setSettings(Config.validate(node.validate(Joi), node.settings()));
                this.getLogger().debug(` |_ '${nodeConf.name}' source loaded`)
                this.nodes.set(node.name(), node);
            }else{
                nClass = this.registry.getSink(nodeConf.type);
                if(nClass){
                    node = new nClass(nodeConf, Log.getLogger().child({node: nodeConf.name}));
                    node.setSettings(Config.validate(node.validate(Joi), node.settings()));
                    this.getLogger().debug(` |_ '${nodeConf.name}' sink loaded`)
                    this.nodes.set(node.name(), node);
                }else{
                    throw Error(`failed to find node of type ${nodeConf.type}`);
                }
            }
        });

        this.getLogger().debug("handle sinks...");
        this.nodes.forEach(node => {
            if (node instanceof SourceNode) {
                this.getLogger().debug(` |_ '${node.name()}' source:`)
                    this.handleOut(node);
            }
        });
        this.getLogger().debug("graph successfully loaded");

        return this;
    }

    private handleOut(node: INode<any>): void {
      if(node.config().out.length > 0){
            this.getLogger().debug(`  \\_ outs: [${node.config().out}]`);
            node.config().out.map(out => {
                const outNode = this.nodes.get(out);
                if (outNode && outNode instanceof SinkNode) {
                    this.getLogger().debug(`   |-> out: ${outNode.name()} sink (${node.name()})`)
                    node.addOut(outNode);

                    if(outNode.config().out.length > 0) {
                        this.getLogger().debug(`  |__ '${outNode.name()}' sink: `)
                        this.handleOut(outNode);
                    }
                } else {
                    throw Error(`failed to find out node named ${out} for node ${node.name()}`);
                }
            });
        }
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


    public hand(source: INode<any>, record: IRecord<any>){
        source.out().map(out => {
            let recordCopy = record.copy();
            recordCopy.pushFlow(out.name(), source.name());
            const h = out.execute(recordCopy).subscribe(outRecord => {
                outRecord.pushMetric(out.name())
                if(h !== undefined){
                    h.unsubscribe();
                }
                this.hand(out, outRecord);
            });
        });
    }

    logOut(node: INode<any>){
        this.getLogger().info(`${node.name()}:`);
        node.out().forEach((n: INode<any>)=>{
            this.getLogger().info(` - out: ${n.name()}`);
            this.logOut(n);
        });
    }

    public start(): Stream {

        const sources: SourceObs[] = [];

        // Init first loop
        this.nodes.forEach(node => {
            if (node instanceof SourceNode) {
                sources.push({
                    source: node,
                    observable: new Observable<IRecord<any>>(subscriber => node.execute(subscriber))
                });
                this.getLogger().info("log out");
                this.logOut(node);
            }
        });

        sources.map((source: SourceObs) => {
            return source.observable.subscribe((record)=>{
                    record.pushFlow(source.source.name(), 'root');
                    record.pushMetric(source.source.name());
                    this.hand(source.source, record);
                    record.pushMetric('end');
                    this.getLogger().error(JSON.stringify({
                        id: record.id(),
                        flow: record.flow().join('-->'),
                        duration: (record.metrics()[record.metrics().length-1].timestamp - record.metrics()[0].timestamp)+ "ms",
                        metrics: record.metrics().map((m, i) => `[${i}] ${m.name} ${m.timestamp}`),
                        data: JSON.stringify(record.data())
                    }))
                });
            });
        return this;
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