const assert = require('assert');
const Connector = require('../../src/connectors/receivers/gitlab');

describe('Connectors - Receivers - Gitlab', function () {
    describe('#Gitlab()', function () {

        it('should return args object ', function (done) {

            const client = {service: 'gitlab', name: 'gitlab'},
                subscription = {name: 'gitlab', settings: { events: ['*']}},
                event = {
                    headers: {
                        'x-gitlab-event': 'event'
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