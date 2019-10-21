const express = require('express');
const https = require('https');
const fs = require('fs');
const Cli = require('./core/cli');
const Publisher = require('./core/client');
const Subscriber = require('./core/subscriber');
const fileUpload = require('express-fileupload');

// parse CLI arguments
const {config, port} = Cli();
const server = express();

// file upload support
server.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024},
}));


// create webhook for each client
let services;

// read new configuration format
if(config.services){
    services = config.services;
}else{
    services = config;
    console.warn("DEPRECATED, please update your configuration file.")
}

Object.keys(services).forEach((name) => {

    const client = new Publisher(name, services[name]);

    if (!client) {
        return;
    }

    // create webhook listener
    client.subscribe.forEach((subscribe) => new Subscriber(server, client, subscribe));
});

server.get('/', (req, res) => {
    res.send('Hello World');
});

// SSL support
if (config.secure && config.secure.enable === true) {
    console.log("[server] create https server");
    https.createServer({
        key: fs.readFileSync(config.secure.key),
        cert: fs.readFileSync(config.secure.cert),
        passphrase: config.secure.passphrase
    }, server).listen(port || config.port, () => {
        console.log(`[server] listening on port ${port || config.port} (HTTPS)`);
    })
}else{
    server.listen(port || config.port || 8080, () => {
        console.log(`[server] listening on port ${port || config.port || 8080}`);
    });
}

