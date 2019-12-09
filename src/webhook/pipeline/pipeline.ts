import {TopologyConfiguration} from "../config/configuration";
import {Log} from "../lib/log";
import Joi from "@hapi/joi";
import {of, pipe, Subscription} from "rxjs";
import {flatMap} from 'rxjs/operators';
import {INode, NodeContext} from "../node/node";
import {Express} from "express";
import {ITuple, Tuple} from "../tuple/tuple";


export interface IPipelineContext {
    server: Express;
    logger: any;
}

export class Pipeline {
    readonly name: string;
    readonly configuration: TopologyConfiguration;
    context: IPipelineContext;
    nodes: INode[] = [];
    references: Map<string, INode>;
    private inputNode: INode;
    private subscription: Subscription;
    private observables: any[] = [];

    constructor(configuration: TopologyConfiguration, nodes: Map<string, INode>, context: IPipelineContext) {
        this.configuration = configuration;
        this.name = this.configuration.name;
        this.context = context;
        this.references = nodes;
    }

    public build(): Pipeline {
        Log.info(`configure topology ${this.name}`);
        Log.debug(`configuration:`, this.configuration);
        this.createNodes();
        return this;
    }

    public start(): Pipeline {

        this.observables[0].subscribe(
            (stream: ITuple<any>) => {
                const operators = this.nodes.map((node: any) => flatMap((stream) => node.execute(stream)));
                of(stream).pipe(pipe.apply(this, operators)).subscribe(
                    (stream: ITuple<any>) => this.inputNode.resolve(stream),
                    (error) => this.inputNode.reject(stream.setError(error))
                )
            },
            (error) => this.inputNode.reject(new Tuple<any>().setError(error))
        );
        return this;
    }

    public stop(): Pipeline {
        if (this.subscription) {
            Log.debug(`Stopping topology=${this.name}`);
            this.subscription.unsubscribe();
        }
        return this;
    }

    private createNodes() {
        for (let i = 0; i < this.configuration.nodes.length; i++) {
            const node = this.configuration.nodes[i];
            if (this.references.has(node.type)) {
                const clazz: any = this.references.get(node.type);
                const instance: INode = new clazz(node.name); //, node.type, settings, this.configuration
                // validate settings before all
                const settings = this.validate(instance.validate(Joi), node.settings);

                const nodeCtx = new NodeContext();
                nodeCtx.pipeline = this;
                nodeCtx.server = this.context.server;

                this.observables.push(instance.prepare(settings, nodeCtx));
                this.nodes.push(instance);
            } else {
                throw new Error(`Node "${node.type}" for pipeline "${this.name}" does not exists.`)
            }
        }

        this.inputNode = this.nodes[0];
    }

    private validate(schema, config) {
        const {error, value} = schema.validate(config);
        if (error && error.details.length > 0) {
            let errorMessages = ["Invalid in configuration:"];
            for (let err of error.details) {
                errorMessages.push(err.message);
                Log.debug(err.message)
            }
            throw new Error(errorMessages.join('\n'))
        }
        return value;
    }
}