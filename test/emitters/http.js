const assert = require('assert');
const sinon = require('sinon');
var proxyquire = require('proxyquire');


describe('Connectors - Emitter - Http', function () {


    describe('Send an HTTP request', function () {

        it('should call http GET', function (done) {

            const client = {service: 'service', name: 'name'},
                publish = {
                    name: 'http',
                    settings: {
                        method: 'GET',
                        url: 'http://test.com/{{headers.x-webhook-event}}/',
                        params: {hello: '{{body.hello}}'},
                        headers: {
                            'x-test': '{{body.hello}}',
                            '{{body.hello}}': 'hello',
                        }
                    }
                },
                subscribe = {},
                event = {
                    headers: {
                        'x-webhook-event': 'event',
                        'x-webhook-signature': 'sha1=',
                    },
                    body: {
                        hello: 'world'
                    },
                    params: {}
                };

            const stubs = {
                'light-http': {
                    'get': function (url, params, headers, cb) {
                        assert.equal(url, 'http://test.com/event/');
                        assert.deepEqual(params, {hello: 'world'});
                        assert.deepEqual(headers, {'x-test': 'world', 'world': 'hello'});
                        return cb(200);
                    },
                    '@global': true
                }
            };

            const Connector = proxyquire('../../src/connectors/emitters/http', stubs);

            Connector(client, publish, subscribe, event)
                .then((response) => {
                    assert.equal(response, 200);
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });


        it('should call http POST', function (done) {

            const client = {service: 'service', name: 'name'},
                publish = {name: 'http', settings: {method: 'POST', url: 'http://test.com', params: {}, headers: {}}},
                subscribe = {},
                event = {
                    headers: {
                        'x-webhook-event': 'event',
                        'x-webhook-signature': 'sha1=',
                    }, body: {}, params: {}
                };

            const stubs = {
                'light-http': {
                    'post': function (url, params, headers, cb) {
                        assert.equal(url, 'http://test.com');
                        assert.deepEqual(params, publish.settings.params);
                        return cb(200);
                    },
                    '@global': true
                }
            };

            const Connector = proxyquire('../../src/connectors/emitters/http', stubs);

            Connector(client, publish, subscribe, event)
                .then((response) => {
                    assert.equal(response, 200);
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });
});