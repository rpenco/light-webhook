const assert = require('assert');
const Connector = require('../src/connectors');

describe('Connectors - Receivers', function () {

    describe('#Github()', function () {

        it('should return args object ', function (done) {

            const client = {service: 'github', name: 'github'},
                subscription = {name: 'github', settings: { events: ['*']}},
                event = {
                    headers: {
                        'user-agent': 'GitHub-Hookshot/1234',
                        'x-github-delivery': '1234-1234-1234-1234',
                        'x-github-event': 'event',
                        'x-hub-signature': 'sha1=',
                    }, body: {}, params: {}
                };

            Connector.receivers.github(client, subscription, event)
                .then((arg) => {
                    assert.deepEqual(arg, event);
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });

    describe('#Gitlab()', function () {

        it('should return args object ', function (done) {

            const client = {service: 'gitlab', name: 'gitlab'},
                subscription = {name: 'gitlab', settings: { events: ['*']}},
                event = {
                    headers: {
                        'x-gitlab-event': 'event'
                    }, body: {}, params: {}
                };

            Connector.receivers.gitlab(client, subscription, event)
                .then((arg) => {
                    assert.deepEqual(arg, event);
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });

    describe('#Http()', function () {

        it('should return args object ', function (done) {

            const client = {service: 'http', name: 'http'},
                subscription = {name: 'http', settings: { events: ['*']}},
                event = {
                    headers: {
                        'x-webhook-event': 'event',
                        'x-webhook-signature': 'sha1=',
                    }, body: {}, params: {}
                };

            Connector.receivers.http(client, subscription, event)
                .then((arg) => {
                    assert.deepEqual(arg, event);
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });
});