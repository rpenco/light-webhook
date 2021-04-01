/**
 * Define here file and outputs references
 */
import {INode} from "../api/node";


export interface Type<T> extends Function {
    new(...args: any[]): T;
}

export class TypeRegistry {
    nodes = new Map<string, Type<INode<any>>>();

    get(type: string): Type<INode<any>> {
        return this.nodes.get(type)
    }

    put(type: string, tClass: Type<INode<any>>): void {
        this.nodes.set(type, tClass)
    }
}
