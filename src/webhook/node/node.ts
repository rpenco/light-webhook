import {Observable} from "rxjs";
import Joi from "@hapi/joi";
import {ITuple} from "../tuple/tuple";
import {Express} from "express";
import {Pipeline} from "../pipeline/pipeline";

export interface INodeContext {
    server: Express;
    pipeline: Pipeline;
}

export class NodeContext implements INodeContext {
    pipeline: Pipeline;
    server: Express;
}

export interface INode {

    /**
     * Validate configuration
     * @param Joi
     */
    validate(Joi): Joi.schema

    /**
     * Prepare listen node
     * @param conf the configuration for this node
     * @param context
     */
    prepare<T>(conf: any, context: INodeContext): Observable<ITuple<T>>;

    /**
     * Execute node
     * @param prevStream
     */
    execute<A, B>(prevStream: ITuple<A>): Observable<ITuple<B>>;

    /**
     * Called when pipeline succeed
     * @param lastStream
     */
    resolve<A, B>(lastStream: ITuple<A>): Observable<ITuple<B>>;

    /**
     * Called when pipeline failed
     * @param lastStream
     */
    reject<A, B>(lastStream: ITuple<A>): Observable<ITuple<B>>;

    /**
     * Called when an IInputNode is going to shutdown.
     * There is no guarantee that close will be called
     */
    close<T>(): Observable<void>
}

export class Node implements INode {
    close<T>(): Observable<void> {
        return undefined;
    }

    execute<A, B>(prevStream: ITuple<A>): Observable<ITuple<B>> {
        return undefined;
    }

    prepare<T>(conf: any, context: INodeContext): Observable<ITuple<T>> {
        return undefined;
    }

    reject<A, B>(lastStream: ITuple<A>): Observable<ITuple<B>> {
        return undefined;
    }

    resolve<A, B>(lastStream: ITuple<A>): Observable<ITuple<B>> {
        return undefined;
    }

    validate(Joi): Joi.schema {
        return undefined;
    }
}