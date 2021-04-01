import {Observable, of, Subscriber} from "rxjs";
import Joi from "joi";
import {IRecord, Record} from "./record";
import {NodeConfiguration} from "./configuration";
import {ILogger} from "./logger";


/*
* NODE CONTEXT
* */

export interface INodeContext {
}

/*
* INODE
* */

export interface INode<Settings> {

    name(): string;

    type(): string;

    settings(): Settings;

    setSettings(settings: Settings): void;

    getLogger(): any;

    out(): Set<ISinkNode<any>>;

    addOut(node: ISinkNode<any>): void;

    /**
     * Prepare listen node
     * @param conf the configuration for this node
     * @param context
     */
    prepare(context: INodeContext): Observable<IRecord<any>>;

    /**
     * Validate configuration
     * @param Joi
     */
    validate(Joi): Joi.Schema

    /**
     * Called when an IInputNode is going to shutdown.
     * There is no guarantee that close will be called
     */
    close(): Observable<void>


    /**
     * Called when pipeline succeed
     * @param lastStream
     */
    resolve<A, B>(lastStream: IRecord<A>): Observable<IRecord<B>>;

    /**
     * Called when pipeline failed
     * @param lastStream
     */
    reject<A, B>(lastStream: IRecord<A>): Observable<IRecord<B>>;
}

export abstract class Node<Settings> implements INode<Settings> {
    private readonly _conf: NodeConfiguration;
    private _subscriber: any;
    private _outNodes: Set<ISinkNode<any>> = new Set();
    private readonly _logger: ILogger;

    constructor(conf: NodeConfiguration, logger: ILogger) {
        this._conf = conf;
        this._logger = logger;
    }

    close(): Observable<void> {
        this.getLogger().debug(`[${this.name()}]#close() - nothing to do. return non breaking observable..`);
        return of();
    }

    prepare(context: INodeContext): Observable<IRecord<any>> {
        this.getLogger().debug(`[${this.name()}]#prepare() - nothing to do. return non breaking observable..`);
        return of(new Record(null));
    }

    reject<A, B>(lastStream: IRecord<A>): Observable<IRecord<B>> {
        this.getLogger().debug(`[${this.name()}]#reject() - nothing to do. return non breaking observable..`);
        return of();
    }

    resolve<A, B>(lastStream: IRecord<A>): Observable<IRecord<B>> {
        this.getLogger().debug(`[${this.name()}]#resolve() - nothing to do. return non breaking observable..`);
        return of();
    }

    abstract validate(Joi): Joi.Schema;

    name(): string {
        return this._conf.name;
    }

    type(): string {
        return this._conf.type;
    }

    settings(): Settings {
        return this._conf.settings as Settings;
    }

    setSettings(setting: Settings): void {
        this._conf.settings = setting;
    }

    out(): Set<ISinkNode<any>> {
        return this._outNodes;
    }

    addOut(node: ISinkNode<any>): void {
        this._outNodes.add(node);
    }

    getLogger(): ILogger {
        return this._logger;
    }
}


/*
* ISOURCENODE
* */

export interface ISourceNode<Setting> extends INode<Setting> {
    execute(subscriber: Subscriber<IRecord<any>>);
}

export abstract class SourceNode<Settings> extends Node<Settings> implements ISourceNode<Settings> {
    abstract execute(subscriber: Subscriber<IRecord<any>>);
}


/*
* ISINKNODE
* */

export interface ISinkNode<Setting> extends INode<Setting> {

    /**
     * Execute node
     * @param subscriber
     * @param record
     */
    execute(subscriber: Subscriber<IRecord<any>>, record: IRecord<any>): void;
}

export abstract class SinkNode<S> extends Node<S> implements ISinkNode<S> {
    abstract execute(subscriber: Subscriber<IRecord<any>>, record: IRecord<any>): void;
}