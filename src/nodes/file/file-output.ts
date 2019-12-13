import {INode, INodeContext} from "../../webhook/node/node";
import {Observable} from "rxjs";
import {ITuple} from "../../webhook/tuple/tuple";
import Joi from "@hapi/joi";

const path = require('path');
const fs = require('fs-extra');
const {Log} = require('../../webhook/lib/log');
const Templatizer = require('../../webhook/lib/templatizer');


interface FileProcessorSettings  {
    create: boolean;
    path: string;
    chown: string;
    chmod: string;
}

export class FileProcessorNode implements INode {
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

    // execute(input, output): void {
    //     const basePath = Templatizer(this.getSettings().path, null);
    //     this.createDirectory(basePath);
    //     this.write(path.join(basePath, input.name), input.stream, input.enconding)
    //         .then(filePath => {
    //             this.chmod(filePath);
    //             this.chown(filePath);
    //         })
    //         .then(() => output.resolve());
    // }
    //
    // private createDirectory(basePath: string): void {
    //     try {
    //         if (this.getSettings().create) {
    //             fs.ensureDir(basePath, {recursive: true});
    //         }
    //     } catch (e) {
    //         if (e.code !== 'EEXIST') {
    //             Log.debug(e);
    //             throw `Failed to created directory ${basePath}`;
    //         }
    //     }
    // }
    //
    // private chmod(filePath: string) {
    //     if (this.getSettings().chmod) {
    //
    //     }
    // }
    //
    // private chown(filePath: string) {
    //     if (this.getSettings().chown) {
    //
    //     }
    // }
    //
    // /**
    //  * Write date to file. Using tuple to memory safe
    //  * @param path to write
    //  * @param chunk data to write
    //  * @param encoding date encoding (default base64)
    //  * @return Promise<string> path
    //  */
    // private write(path: string, chunk: string, encoding: string = 'base64'): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         const stream = fs.createWriteStream(path);
    //
    //         // write some data with a base64 encoding
    //         stream.write(chunk, encoding);
    //
    //         // the finish event is emitted when all data has been flushed from the tuple
    //         stream.on('finish', () => {
    //             console.log('wrote all data to file');
    //             resolve(path);
    //         });
    //         // close the tuple
    //         stream.end();
    //     });
    // }
}
