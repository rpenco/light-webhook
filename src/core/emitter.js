const connectors = require('../connectors');

module.exports = function Emitter(client, publish, subscribe, event) {

    const {body, headers, params} = event;
    const {service, name, description, settings} = publish;
    const {emitters} = connectors;
    const emitter = emitters[service];

    if (emitter && typeof emitter === 'function') {
        return emitter(client, publish, subscribe, event);
    } else {
        return Promise.reject('Publish service not found')
    }
};