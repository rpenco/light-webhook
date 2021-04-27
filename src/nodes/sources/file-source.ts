import {Subscriber} from "rxjs";
import * as Joi from "joi";
import {AnyRecord, Record, SourceNode} from "../../api";
import * as fs from "fs";

export interface Settings {
    file: string;
    load: boolean;
}

export class FileSource extends SourceNode<Settings> {

    validate(Joi): Joi.Schema {
        return Joi.object({
            file: Joi.string().required(),
            load: Joi.boolean().default(true)
        }).default();
    }

    execute(subscriber: Subscriber<AnyRecord>) {
        const filePath = this.settings().file;
        fs.watch(filePath, (e, filename) => {
            this.getLogger().debug(`file ${filePath} change - times`);
            const stats = fs.statSync(filePath);

            const record = new Record({
                files: [{
                    path: filePath,
                    size: stats.size,
                    creationDate: stats.ctime,
                    modificationDate: stats.mtime,
                    mode: stats.mode,
                    groupId: stats.gid,
                    userId: stats.uid,
                    content: this.settings().load ? fs.readFileSync(filePath) : ''
                }]
            });
            subscriber.next(record)
        });
    }

}

