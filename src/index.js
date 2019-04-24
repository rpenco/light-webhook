const server = require('light-http-server');
const Cli = require('./core/cli');
const Client = require('./core/client');
const Receiver = require('./core/receiver');

// parse CLI arguments
const argv = Cli();

// create webhook for each client
Object.keys(argv.config).forEach((name) => {

    const client = new Client(name, argv.config[name]);

    if (!client) {
        return;
    }

    // create webhook listener
    client.subscribe.forEach((subscribe) => new Receiver(server, client, subscribe));
});

console.log(`server listening on port ${argv.port}`);
server.listen(argv.port);