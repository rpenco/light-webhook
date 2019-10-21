const assert = require('assert');
const Connector = require('../../src/connectors/publishers/bash');

describe('Connectors - Publisher - Bash', function () {
    describe('Bash', function () {

        it('should execute command', function (done) {

            const client = {service: 'service', name: 'name'},
                subscribe = {},
                publish = {name: 'bash', settings: {cmd: ['echo', 'Hello {{body.world}}']}},
                event = {
                    headers: {
                        'x-webhook-event': 'event',
                        'x-webhook-signature': 'sha1=',
                    },
                    body: {
                        world: 'my-world'
                    },
                    params: {}
                };

            Connector(client, publish, subscribe, event)
                .then((arg) => {
                    assert.deepEqual(arg, {err: null, stdout: 'Hello my-world\n', stderr: '', code: 0});
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });

        it('should execute command with args', function (done) {

            const client = {service: 'service', name: 'name'},
                subscribe = {},
                publish = {name: 'bash', settings: {cmd: ['echo', 'Hello {{body}}'] , stringify: true }},
                event = {
                    headers: {
                        'x-webhook-event': 'event',
                        'x-webhook-signature': 'sha1=',
                    },
                    body: {
                        world: 'my-world'
                    },
                    params: {}
                };

            Connector(client, publish, subscribe, event)
                .then((arg) => {
                    assert.deepEqual(arg, {err: null, stdout: 'Hello {world:my-world}\n', stderr: '', code: 0});
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });

});