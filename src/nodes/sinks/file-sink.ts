import {Observable, Subscriber} from "rxjs";
import {AnyRecord, SinkNode} from "../../api";
import Joi from "joi";
import {Templatizer} from "../../lib";
import {fromPromise} from "rxjs/internal/observable/fromPromise";

const path = require('path');
const fs = require('fs-extra');


interface FileProcessorSettings {
    create: boolean;
    path: string;
    chown: string;
    chmod: string;
}

export class FileSink extends SinkNode<FileProcessorSettings> {

    // TODO WORK IN PROGRESS. SINK NOT WORK. ANY CONTRIBUTION IS WELCOME

    validate(Joi): Joi.Schema {
        return Joi.object({
            create: Joi.boolean().default(true),
            path: Joi.string().required(),
            chown: Joi.string(),
            chmod: Joi.string()
        }).default();
    }

    execute(record: AnyRecord): Observable<AnyRecord> {
        const basePath = Templatizer.compile(this.settings().path, null);
        const input = record.data();
        this.createDirectory(basePath);
        return fromPromise(this.write(path.join(basePath, input.name), input.stream, input.enconding)
            .then(filePath => {
                this.chmod(filePath);
                this.chown(filePath);
                return filePath;
            })
            .then((filePath) => {
                record.setData(filePath)
                return record;
            }));
    }

    private createDirectory(basePath: string): void {
        try {
            if (this.settings().create) {
                fs.ensureDir(basePath, {recursive: true});
            }
        } catch (e) {
            if (e.code !== 'EEXIST') {
                this.getLogger().debug(e);
                throw `Failed to created directory ${basePath}`;
            }
        }
    }

    private chmod(filePath: string) {
        if (this.settings().chmod) {

        }
    }

    private chown(filePath: string) {
        if (this.settings().chown) {

        }
    }

    /**
     * Write date to file. Using record to memory safe
     * @param path to write
     * @param chunk data to write
     * @param encoding date encoding (default base64)
     * @return Promise<string> path
     */
    private write(path: string, chunk: string, encoding: string = 'base64'): Promise<string> {
        return new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(path);

            // write some data with a base64 encoding
            stream.write(chunk, encoding);

            // the finish event is emitted when all data has been flushed from the record
            stream.on('finish', () => {
                console.log('wrote all data to file');
                resolve(path);
            });
            // close the record
            stream.end();
        });
    }
}
