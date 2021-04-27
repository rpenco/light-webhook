import {v4 as uuidv4} from 'uuid';

export interface IRecord<Row> {
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
    data(): Row;

    /**
     * Update data during stream
     * @param data
     */
    setData(data: Row): void;

    flow(): string[];

    pushFlow(name: string, source:string): void;

    metrics(): Metric[];

    pushMetric(name: string): void;

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
    copy(): IRecord<any>;
}
class Metric{
    name: string;
    timestamp: number = new Date().getTime();
    constructor(name: string) {
        this.name = name;
    }
}

export class Record<Row> implements IRecord<Row> {
    _id: string;
    _data: Row;
    _timestamp: number;
    _error: Error;
    _flow: string[];
    _metrics: Metric[] = [];

    constructor(data: Row) {
        this._id = uuidv4();
        this._timestamp = new Date().getTime();
        this._data = {...data };
        this._flow = [];
        this._metrics.push(new Metric('root'));
    }

    id(): string {
        return this._id;
    }

    timestamp(): number {
        return this._timestamp;
    }

    data(): Row {
        return this._data;
    }

    setData(data: Row): void {
        this._data = data;
    }


    flow(): string[] {
        return this._flow;
    }

    pushFlow(name: string, source:string): void {
        this._flow.push(`[${name}:${source}]`);
    }

    metrics(): Metric[] {
        return this._metrics;
    }

    pushMetric(name: string): void {
        this._metrics.push(new Metric(name));
    }

    copy(): IRecord<any> {
        let record = new Record(this.data());
        record._id = this.id()+'-copy';
        record._flow = this.flow();
        record._error = this._error;
        record._metrics = this.metrics();
        record._timestamp = this.timestamp();
        return record;
    }


    // private headers: { [k: string]: string } = {};
    // private context: { [k: string]: string } = {};
    // private files: { [k: string]: string } = {};
    // private file: {};
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



    // setHeaders(headers: { [k: string]: string }): IRecord<T> {
    //     this.headers = headers;
    //     return this;
    // }
    //
    // setId(id: string): IRecord<T> {
    //     this.id = id;
    //     return this;
    // }



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

    // setFiles(files: { [k: string]: any }): IRecord<Row> {
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