const path = require('path');
const fs = require('fs-extra')
const {Log} = require('../../common/log');
const Templatizer = require('../../common/templatizer');

/**
 *
 * @param client
 * @param publish
 * @param subscribe
 * @param event {body: Object, headers:Object, params: Object, file: Object }
 * @returns {Promise<unknown>}
 */
module.exports = function FilePublisher(client, publish, subscribe, event) {
    return new Promise(function (resolve, reject) {
        Log.info(`[${client.name}][${publish.name}] perform upload`);

        if (!event.files || Object.keys(event.files).length === 0) {
            Log.error(`[${client.name}][${publish.name}] no file to upload.`);
            return reject({
                err: "no file uploaded.",
                stdout: "",
                stderr: "",
                code: 1
            })
        }

        const files = event.files;
        const settings = publish.settings;

        files.forEach(file => {
            // const file = event.files[fileName];
            Log.info(`[${client.name}][${publish.name}] receive file=${file.originalname} size=${file.size} mimetype=${file.mimetype}`);
            if (settings.path) {
                const basePath = Templatizer(settings.path, event);
                if (basePath === undefined) {
                    Log.error(`[${client.name}][${publish.name}] failed to templating`);
                    return reject({
                        err: "Failed to templating",
                        stdout: "",
                        stderr: "Failed to templating",
                        code: 1
                    });
                }
                const p = path.join(basePath, file.originalname);
                if (settings.mkdir === true) {
                    Log.info(`[${client.name}][${publish.name}] create directory ${basePath} if not exists.`);
                    try{
                        fs.ensureDir(basePath, {recursive: true});
                    }catch (e) {
                        if(e.code !== 'EEXIST'){
                            return reject({
                                err: e,
                                stdout: '',
                                stderr: 'Failed to created directory'
                            })
                        }
                    }
                }

                Log.info(`[${client.name}][${publish.name}] move file ${file.path} to ${p}`);
                fs.move(file.path, p, { overwrite: true }, (err) => {
                    if (err) {
                        Log.error(`[${client.name}][${publish.name}] failed to move file`, err);
                        return reject({
                            err: err,
                            stdout: "",
                            stderr: "Failed to move file",
                            code: 1
                        })
                    }
                    Log.info(`[${client.name}][${publish.name}] resolved.`);
                    return resolve(event);
                });
            } else {
                Log.error(`[${client.name}][${publish.name}] no path defined.`)
            }
        })
    });
};
