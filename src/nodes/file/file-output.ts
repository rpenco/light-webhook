import {INode} from "../../webhook/node/node";

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

    execute(input, output): void {
        const basePath = Templatizer(this.getSettings().path, null);
        this.createDirectory(basePath);
        this.write(path.join(basePath, input.name), input.stream, input.enconding)
            .then(filePath => {
                this.chmod(filePath);
                this.chown(filePath);
            })
            .then(() => output.resolve());
    }

    private createDirectory(basePath: string): void {
        try {
            if (this.getSettings().create) {
                fs.ensureDir(basePath, {recursive: true});
            }
        } catch (e) {
            if (e.code !== 'EEXIST') {
                Log.debug(e);
                throw `Failed to created directory ${basePath}`;
            }
        }
    }

    private chmod(filePath: string) {
        if (this.getSettings().chmod) {

        }
    }

    private chown(filePath: string) {
        if (this.getSettings().chown) {

        }
    }

    /**
     * Write date to file. Using tuple to memory safe
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

            // the finish event is emitted when all data has been flushed from the tuple
            stream.on('finish', () => {
                console.log('wrote all data to file');
                resolve(path);
            });
            // close the tuple
            stream.end();
        });
    }
}
