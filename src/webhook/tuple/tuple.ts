export interface ITuple<T> {
    getData(): T;

    setData(data: T): ITuple<T>;

    setHeaders(headers: { [k: string]: string }): ITuple<T>;

    getHeaders(): { [k: string]: string };

    getHeader(key: string): string;

    setContext(ctx: { [k: string]: any }): ITuple<T>;

    addContext(key: string, ctx: any): ITuple<T>;

    getContext(): { [k: string]: string };

    setId(id: string): ITuple<T>;

    getId(): string;

    setError(error: Error): ITuple<T>;

    getError(): Error;

    setFiles(files: { [k: string]: any }): ITuple<T>;

    getFiles(): { [k: string]: any };
}

export class Tuple<T> implements ITuple<T> {
    private id: string;
    private data: T;
    private error: Error;
    private headers: { [k: string]: string } = {};
    private context: { [k: string]: string } = {};
    private files: { [k: string]: string } = {};

    getContext(): { [k: string]: string } {
        return this.context;
    }

    getData(): T {
        return this.data;
    }

    getHeaders(): { [k: string]: string } {
        return this.headers;
    }

    setContext(ctx: { [k: string]: any }): ITuple<T> {
        this.context = ctx;
        return this;
    }


    addContext(key: string, ctx: any): ITuple<T> {
        this.context[key] = ctx;
        return this;
    }

    setData(data: T): ITuple<T> {
        this.data = data;
        return this;
    }

    setHeaders(headers: { [k: string]: string }): ITuple<T> {
        this.headers = headers;
        return this;
    }

    setId(id: string): ITuple<T> {
        this.id = id;
        return this;
    }

    getId(): string {
        return this.id;
    }

    getHeader(key: string): string {
        return this.headers[key];
    }

    getError(): Error {
        return this.error;
    }

    setError(error: Error): ITuple<T> {
        this.error = error;
        return this;
    }

    addFile(key: string, file: any): ITuple<T> {
        this.files[key] = file;
        return this;
    }

    setFiles(files: { [k: string]: any }): ITuple<T> {
        this.files = files;
        return this;
    }

    getFiles(): { [k: string]: any } {
        return this.files;
    }
}