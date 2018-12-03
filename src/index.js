const server = require('light-http-server');
const InlineArgs = require('./common/inlineArgs');
const connectors = require('./connectors');

/**
 * Parse argv
 */
const argv = require('yargs')

    .option('config')
    .coerce('config', function (arg) {
        let file = require('fs').readFileSync(arg, 'utf8');
        file = JSON.parse(file);

        return file;
    })
    .demandOption('config')
    .string('config')
    .completion()
    .describe('config', 'Path to configuration file')

    .option('port')
    .number('port')
    .describe('port', 'server port')
    .default('port', 8080)

    .help('help')
    .detectLocale(false)
    .parse();

const config = argv.config;
if (config.length == 0) {
    console.warn('empty configuration.');
    process.exit(1);
}

// create webhook client
config.forEach((app) => {

    // audit client object
    app.name = Object.keys(app)[0];
    const client = app[app.name];
    client.name = app.name;

    console.log(`[${app.name}] configuration: `, InlineArgs(app));

    if (!client.subscribe || client.subscribe.length == 0) {
        console.error(`[${client.name}] client has not subscription !`);
        return;
    }

    if (!client.publish || client.publish.length == 0) {
        console.error(`[${client.name}] client has not publication !`);
        return;
    }


    // foreach subscription
    client.subscribe.forEach((subscription) => {

        const url = `/${client.name}/${subscription.name}`;
        client.url = url;

        console.log(`[${client.name}] create webhook "${url}"`);

        server.post(url, function (req, res) {

            // parse body
            let body = "";
            req.on('readable', function () {
                body += req.read();
            });
            req.on('end', function () {

                // parse body
                body = JSON.parse(body.substr(0, body.length - 'null'.length));

                console.log(`[${client.name}][${subscription.name}] use receiver "${subscription.service}"`);

                const promise = connectors.receivers[subscription.service](client, subscription, {
                    body: body,
                    headers: req.headers,
                    params: req.param
                });

                promise.then((args) => {

                    console.log(`[${client.name}][${subscription.name}] returns args: ${InlineArgs(args)}`);

                    const accumulator = [];

                    // call publications
                    client.publish.forEach((publication) => {
                        console.log(`[${client.name}][${publication.name}] use emitter "${publication.service}"`);
                        accumulator.push(connectors.emitters[publication.service](client, publication, args));
                    });

                    return Promise.all(accumulator)
                        .then(() => {
                            // TODO send report
                            console.log(`[${client.name}] done.`);
                            res.send("ok");
                        })
                }).catch((err) => {
                    console.error(`[${client.name}]`, err);
                    res.send("ko");
                })
            });
        });
    });
});

console.log(`server listening on port ${argv.port}`);
server.listen(argv.port);