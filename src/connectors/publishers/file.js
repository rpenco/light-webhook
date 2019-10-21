const path = require('path');

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
        if (!event.files || Object.keys(event.files).length === 0) {
            return reject({
                err: "no file uploaded.",
                stdout: "",
                stderr: "",
                code: 1
            })
        }

        const files = Object.keys(event.files);
        const settings = publish.settings;

        files.forEach(fileName => {
            const file = event.files[fileName];

            console.log(`[file] receive file ${file.name}`);
            if (settings.path) {
                const p = path.join(settings.path, file.name);
                console.log(`[file] move file ${file.name} to ${p}`);
                file.mv(p, (err) => {
                    if (err) {
                        return reject({
                            err: err,
                            stdout: "",
                            stderr: "Failed to move file",
                            code: 1
                        })
                    }
                    return resolve(event);
                });
            }
        })
    });
};
