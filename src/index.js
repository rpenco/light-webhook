const express = require('express');
const Cli = require('./core/cli');
const Publisher = require('./core/client');
const Subscriber = require('./core/subscriber');
const fileUpload = require('express-fileupload');

// parse CLI arguments
const {config, port} = Cli();
const server = express();

server.use(fileUpload({
    limits: {fileSize: 50 * 1024 * 1024},
}));

// create webhook for each client
Object.keys(config).forEach((name) => {

    const client = new Publisher(name, config[name]);

    if (!client) {
        return;
    }

    // create webhook listener
    client.subscribe.forEach((subscribe) => new Subscriber(server, client, subscribe));
});


server.listen(port, () => {
    console.log(`[server] listening on port ${port}`);
});