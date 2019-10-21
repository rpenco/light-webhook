const express = require('express');
const https = require('https');
const fs = require('fs');
const Publisher = require('./core/client');
const Subscriber = require('./core/subscriber');
const busboy = require('connect-busboy');
const {Cli} = require("./core/cli");
const {Log} = require("./common/log");
const bodyParser = require('body-parser');

// parse CLI arguments
const {config} = Cli();
const server = express();

// file upload support
const max_size = (parseInt(config.upload_max_size) || 0) * 1024 * 1024;
Log.info(`[server] Upload max size ${max_size} Bytes. Set 'upload_max_size' (in MegaBytes) to change this value.`);
// server.use(fileUpload({
//     limits: {fileSize: max_size},
// }));

server.use(busboy({
    highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
})); // Insert the busboy middle-ware

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
server.use(bodyParser.json());

// create webhook for each client
let services;

// read new configuration format
if (config.services) {
    services = config.services;
} else {
    services = config;
    console.warn("DEPRECATED, please update your configuration file.")
}

Object.keys(services).forEach((name) => {

    const client = new Publisher(name, services[name]);

    if (!client) {
        return;
    }

    // create webhook listener
    client.subscribe.forEach((subscribe) => new Subscriber({server, client, subscribe}));
});

server.get('/', (req, res) => {
    Log.debug('[server] /');
    res.send('');
});

// SSL support
if (config.security && config.security.enable === true) {
    Log.debug("[server] create https server");
    https.createServer({
        key: fs.readFileSync(config.secure.key),
        cert: fs.readFileSync(config.secure.cert),
        passphrase: config.secure.passphrase
    }, server).listen((config.port || 8080), (config.hostname || '0.0.0.0'), () => {
        Log.info(`[server] listening on https://${config.hostname || '0.0.0.0'}:${config.port || 8080}`);
    })
} else {
    server.listen(config.port || 8080, (config.hostname || '0.0.0.0'), () => {
        Log.info(`[server] listening on http://${config.hostname || '0.0.0.0'}:${config.port || 8080}`);
    });
}

