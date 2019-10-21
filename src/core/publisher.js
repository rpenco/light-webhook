const connectors = require('../connectors');

module.exports = function Publisher(client, publish, subscribe, event) {

    const {body, headers, params} = event;
    const {service, name, description, settings} = publish;
    const {publishers} = connectors;
    const publisher = publishers[service];

    if (publisher && typeof publisher === 'function') {
        return publisher(client, publish, subscribe, event);
    } else {
        console.error(`${(new Date()).toISOString()} [${client.name} publish service "${publish.name}" not found.`);
        return Promise.reject('Publish service not found')
    }
};