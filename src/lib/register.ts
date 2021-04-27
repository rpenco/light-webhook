/**
 * Define here file and outputs references
 */
import {INode, ISinkNode, ISourceNode} from "../api/node";


export interface Type<T> extends Function {
    new(...args: any[]): T;
}

export class TypeRegistry {
    sources = new Map<string, Type<ISourceNode<any>>>();
    sink = new Map<string, Type<ISinkNode<any>>>();

    getSource(type: string): Type<ISourceNode<any>> {
        return this.sources.get(type)
    }

    putSource(type: string, tClass: Type<ISourceNode<any>>): void {
        this.sources.set(type, tClass)
    }

    getSink(type: string): Type<ISinkNode<any>> {
        return this.sink.get(type)
    }

    putSink(type: string, tClass: Type<ISinkNode<any>>): void {
        this.sink.set(type, tClass)
    }
}
