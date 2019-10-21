const connectors = require('../connectors');

module.exports = function Publisher(client, publish, subscribe, event) {

    const {body, headers, params} = event;
    const {service, name, description, settings} = publish;
    const {publishers} = connectors;
    const emitter = publishers[service];

    if (emitter && typeof emitter === 'function') {
        return emitter(client, publish, subscribe, event);
    } else {
        return Promise.reject('Publish service not found')
    }
};