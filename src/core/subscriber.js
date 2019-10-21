const connectors = require('../connectors');
const Emitter = require('./publisher');
const bodyParser = require('./body-parser');
const InlineArgs = require('../common/inlineArgs');
const querystring = require('querystring');

module.exports = function Subscriber(server, client, subscribe) {

    const {service, name, description, settings} = subscribe;
    const {subscribers} = connectors;
    const receiver = subscribers[service];

    if (!receiver || typeof receiver !== 'function') {
        return Promise.reject('Subscribe service not found !')
    }

    const url = `/${client.name}/${name}`;
    client.url = url;

    const method = settings && settings.method ? settings.method.toLowerCase() : 'post';
    console.log(`[${client.name}] create webhook (${method.toUpperCase()}) "${url}"`);


    // webhook client
    server[method](client.url, (req, res) => {
        console.log(`[${client.name}] [${req.method.toUpperCase()}] "${url}"`);

        bodyParser(req, () => {

            const event = {
                body: req.body,
                headers: req.headers,
                params: querystring.parse(req.url),
                files: req.files
            };


        // console.log(`[${client.name}] webhook event: ${InlineArgs(event)}`);

            const promise = receiver(client, subscribe, event)
                .then(() => {
                    const promises = [];
                    const promise = client.publish.map((publish) => {
                            return (new Emitter(client, publish, subscribe, event)).then((output)=> {
                            const result = { client: client.name, subscribe: subscribe.name, publish: publish.name, output: output};
                            return result;
                        });
                    });
                    promises.push(promise);
                    return Promise.all(promises)
                        .then((results) => {
                            res.send({status: 'done'})
                        })
                })
                .catch((err) => {
                    console.error(`[${client.name}] catch error:`, err);
                    res.send({status: 'failed', error: err.message})
                });
        });
    });
};
