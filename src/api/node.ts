import {Observable, of, Subscriber} from "rxjs";
import Joi from "joi";
import {IRecord} from "./record";
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

    config(): NodeConfiguration;

    settings(): Settings;

    setSettings(settings: Settings): void;

    getLogger(): ILogger;

    out<Row>():ISinkNode<Row>[];

    addOut<Row>(node: ISinkNode<Row>): void;

    setOut<Row>(nodes: ISinkNode<Row>[]): void;

    /**
     * Prepare listen node
     * @param conf the configuration for this node
     * @param context
     */
    prepare(context: INodeContext): Observable<boolean>;

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
     * @param record
     */
    resolve<Row>(record: IRecord<Row>): Observable<IRecord<Row>>;

    /**
     * Called when pipeline failed
     * @param record
     */
    reject<Row>(record: IRecord<Row>): Observable<IRecord<Row>>;
}

export abstract class Node<Settings> implements INode<Settings> {
    private readonly _conf: NodeConfiguration;
    private _outNodes: ISinkNode<any>[] = [];
    private readonly _logger: ILogger;

    constructor(conf: NodeConfiguration, logger: ILogger) {
        this._conf = conf;
        this._logger = logger;
    }

    close(): Observable<void> {
        this.getLogger().debug(`close - return void`);
        return of();
    }

    prepare(context: INodeContext): Observable<boolean> {
        this.getLogger().debug(`prepare - return true`);
        return of(true);
    }

    reject<Row>(record: IRecord<Row>): Observable<IRecord<Row>> {
        this.getLogger().debug(`reject - return received record`);
        return of(record);
    }

    resolve<Row>(record: IRecord<Row>): Observable<IRecord<Row>> {
        this.getLogger().debug(`resolve - return received record`);
        return of(record);
    }

    abstract validate(Joi): Joi.Schema;

    name(): string {
        return this._conf.name;
    }

    type(): string {
        return this._conf.type;
    }

    config(): NodeConfiguration {
        return this._conf;
    }

    settings(): Settings {
        return this._conf.settings as Settings;
    }

    setSettings(setting: Settings): void {
        this._conf.settings = setting;
    }

    out(): ISinkNode<any>[] {
        return this._outNodes;
    }

    addOut(node: ISinkNode<any>): void {
        this._outNodes.push(node);
    }

    setOut(nodes: ISinkNode<any>[]): void {
        this._outNodes = nodes;
    }

    getLogger(): ILogger {
        return this._logger;
    }
}


/*
* ISOURCE NODE
* */

export interface ISourceNode<Setting> extends INode<Setting> {
    // execute<Row>(): Observable<IRecord<Row>>;
    execute<Row>(subscriber: Subscriber<IRecord<Row>>): void;
}

export abstract class SourceNode<Settings> extends Node<Settings> implements ISourceNode<Settings> {
    // abstract execute<Row>(): Observable<IRecord<Row>>;
    execute<Row>(subscriber: Subscriber<IRecord<Row>>): void {};
}


/*
* ISINK NODE
* */

export interface ISinkNode<Setting> extends INode<Setting> {

    /**
     * Execute node
     * @param subscriber
     * @param record
     */
    execute<Row>(record: IRecord<Row>): Observable<IRecord<Row>>;
}

export abstract class SinkNode<S> extends Node<S> implements ISinkNode<S> {
    abstract execute<Row>(record: IRecord<any>): Observable<IRecord<Row>>;
}