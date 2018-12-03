const connectors = require('../connectors');
const Emitter = require('./emitter');
const bodyParser = require('./body-parser');
const querystring = require('querystring');

module.exports = function Receiver(server, client, subscribe) {

    const {service, name, description, settings} = subscribe;
    const {receivers} = connectors;
    const receiver = receivers[service];

    if (!receiver || typeof receiver !== 'function') {
        return Promise.reject('Subscribe service not found !')
    }

    const url = `/${client.name}/${name}`;
    client.url = url;

    const method = settings && settings.method ? settings.method.toLowerCase() : 'post';
    console.log(`[${client.name}] create webhook (${method.toUpperCase()}) "${url}"`);


    // webhook client
    server[method](client.url, (req, res) => {
        bodyParser(req, () => {

            const event = {
                body: req.body,
                headers: req.headers,
                params: querystring.parse(req.url)
            };


            const promise = receiver(client, subscribe, event)
                .then(() => {
                    const promises = [];
                    const promise = client.publish.map((publish) => {
                        return new Emitter(client, publish, subscribe, event)
                    });
                    promises.push(promise);
                    return Promise.all(promises);
                })
                .then((results) => res.send({status: 'done', services: results}))
                .catch((err) => res.send({status: 'failed', error: err}));
        });
    });
};
