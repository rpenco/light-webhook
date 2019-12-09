const assert = require('assert');
const Connector = require('../../src/nodes/http/http-input');

describe('Connectors - Receivers - Http', function () {

    describe('Receive an HTTP POST', function () {

        it('should return args object ', function (done) {

            const client = {service: 'http', name: 'http'},
                subscription = {name: 'http', settings: { events: ['*']}},
                event = {
                    headers: {
                        'x-webhook-event': 'event',
                        'x-webhook-signature': 'sha1=',
                    }, body: {}, params: {}
                };

            Connector(client, subscription, event)
                .then((arg) => {
                    assert.deepEqual(arg, event);
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });
});