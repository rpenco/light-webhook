import {v4 as uuidv4} from 'uuid';

export interface IRecord<T> {
    /**
     * Get record id (uuid v4) ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
     */
    id(): string;

    /**
     * Get record created timestamp
     */
    timestamp(): number;

    /**
     * Get data enriched/modified during stream
     */
    data(): T;


    /**
     * Update data during stream
     * @param data
     */
    setData(data: T): void;

    // setHeaders(headers: { [k: string]: string }): IRecord<T>;

    // getHeaders(): { [k: string]: string };

    // getHeader(key: string): string;

    // setContext(ctx: { [k: string]: any }): IRecord<T>;

    // addContext(key: string, ctx: any): IRecord<T>;

    // getContext(): { [k: string]: string };

    // setId(id: string): IRecord<T>;



    // setError(error: Error): IRecord<T>;

    // getError(): Error;

    // setFiles(files: { [k: string]: any }): IRecord<T>;

    // getFiles(): { [k: string]: any };

    // setCurrentFile(file: any): IRecord<T>;

    // getCurrentFile(): any;
}

export class Record<T> implements IRecord<T> {
    private _id: string;
    private _data: T;
    private _timestamp: number;
    private _error: Error;

    // private headers: { [k: string]: string } = {};
    // private context: { [k: string]: string } = {};
    // private files: { [k: string]: string } = {};
    // private file: {};

    constructor(data: T) {
        this._id = uuidv4();
        this._timestamp = new Date().getTime();
        this._data = {...data };
    }

    data(): T {
        return this._data;
    }

    // getHeaders(): { [k: string]: string } {
    //     return this.headers;
    // }
    //
    // setContext(ctx: { [k: string]: any }): IRecord<T> {
    //     this.context = ctx;
    //     return this;
    // }
    //
    //
    // addContext(key: string, ctx: any): IRecord<T> {
    //     this.context[key] = ctx;
    //     return this;
    // }

    setData(data: T): void {
        this._data = data;
    }

    // setHeaders(headers: { [k: string]: string }): IRecord<T> {
    //     this.headers = headers;
    //     return this;
    // }
    //
    // setId(id: string): IRecord<T> {
    //     this.id = id;
    //     return this;
    // }

    id(): string {
        return this._id;
    }

    timestamp(): number {
        return this._timestamp;
    }

    // getHeader(key: string): string {
    //     return this.headers[key];
    // }

    // getError(): Error {
    //     return null; //this.error;
    // }

    // setError(error: Error): IRecord<T> {
        // this.error = error;
        // return this;
    // }

    // addFile(key: string, file: any): IRecord<T> {
    //     this.files[key] = file;
    //     return this;
    // }

    // setFiles(files: { [k: string]: any }): IRecord<T> {
    //     this.files = files;
    //     return this;
    // }

    // getFiles(): { [k: string]: any } {
    //     return this.files;
    // }

    // setCurrentFile(file: any): IRecord<T> {
    //     this.file = file;
    //     return this;
    // }

    // getCurrentFile(): any {
    //     return this.file;
    // }

}

export class AnyRecord extends Record<any> {
}

export class VoidRecord extends Record<void> {
    constructor() {
        super(null);
    }
}