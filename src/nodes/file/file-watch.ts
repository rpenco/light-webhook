import {INode, INodeContext} from "../../webhook/node/node";
import {Observable} from "rxjs";
import {ITuple} from "../../webhook/tuple/tuple";
import * as Joi from "@hapi/joi";

export class FileOutputNode implements INode {

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

