const connectors = require('../connectors');
const Publisher = require('./publisher');
const path = require('path');
const querystring = require('querystring');
const multer = require("multer");
const {Log} = require('../common/log');
const fs = require('fs-extra');             // Classic fs


module.exports = function Subscriber(ctx) {
    const {server, client, subscribe} = ctx;
    const {service, name, settings} = subscribe;
    const {subscribers} = connectors;
    const subscriber = subscribers[service];

    if (!subscriber || typeof subscriber !== 'function') {
        Log.error(`[${client.name}] subscribe service "${subscribe.name}" not found.`);
        return Promise.reject(`[${client.name}] subscribe service "${subscribe.name}" not found.`)
    }

    const url = `/${client.name}/${name}`;
    client.url = url;

    const method = settings && settings.method ? settings.method.toLowerCase() : 'post';
    Log.info(`${client.name}] create [${method.toUpperCase()}] "${url}" webhook.`);

    // webhook client
    const upload_path = settings.upload ? settings.upload.path : '/tmp';
    const limit = settings.upload ? settings.upload.limit : 0;
    server[method](client.url,
        // multer({
        // dest: upload_path,
        // limit: limit,
        // fileFilter: function (req, file, cb) {
        //
        //     var filetypes = /txt|text\/plain/;
        //     var mimetype = filetypes.test(file.mimetype);
        //     console.log("file.mimetype", file.mimetype)
        //     var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        //
        //     if (mimetype && extname) {
        //         return cb(null, true);
        //     }
        //     cb("Error: File upload only supports the following filetypes - " + filetypes);
        // }
        // }).any(),
        download({dest: upload_path, limit: limit}), (req, res, next) => Execute(ctx, req, res, next));
};

function download({dest, limit}) {

    return (req, res, next) => {

        req.busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            req.body[fieldname] = val;
        });

        req.busboy.on('file', (fieldname, file, filename) => {
            Log.info(`Upload of '${dest}/${filename}' started..`);
            if (!req.files) {
                req.files = [];
            }
            // Create a write stream of the new file
            const tmpPath = path.join(dest, filename);
            const fstream = fs.createWriteStream(tmpPath);
            let size = 0;
            file.on('data', function (data) {
                size += data.length;
            });
            file.on('end', function () {
                Log.info('File [' + fieldname + '] uploaded');
                req.files.push({
                    originalname: filename,
                    size: size,
                    path: tmpPath
                });

            });

            // Pipe it trough
            file.pipe(fstream);
        });
        req.busboy.on('finish', () => {
            Log.info('Upload finish ');
            next()
        });

        req.pipe(req.busboy); // Pipe it trough busboy
    }
}

function Execute(ctx, req, res, next) {

    const {client, subscribe} = ctx;
    const {service} = subscribe;
    const {subscribers} = connectors;
    const subscriber = subscribers[service];

    Log.info(`${client.name}] [${req.method.toUpperCase()}] "${client.url}"`);
    const event = {
        body: req.body,
        headers: req.headers,
        params: querystring.parse(req.url),
        files: req.files
    };

    subscriber(client, subscribe, event)
        .then(() => {
            const promises = [];
            client.publish.forEach((publish) => {
                promises.push((new Publisher(client, publish, subscribe, event))
                    .then((output) => {
                        return {
                            client: client.name,
                            subscribe: subscribe.name,
                            publish: publish.name,
                            output: output
                        };
                    }));
            });
            return Promise.all(promises)
                .then((results) => {
                    Log.debug("done.");
                    res.send({status: 'done'})
                }).catch((error) => {
                    Log.error("Failed to execute pipeline:", error);
                    res.send(error).status(500)
                })
        })
        .catch((err) => {
            Log.error(`[${client.name}] catch error:`, err);
            res.send({status: 'failed', error: err.message})
        });
}
