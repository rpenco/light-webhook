const assert = require('assert');
const Connector = require('../src/connectors');

describe('Connectors - Receivers', function () {

    describe('#Github()', function () {

        it('should return args object ', function (done) {

            const client = {service: 'github', name: 'github'},
                subscribe = {name: 'github'},
                args = {};

            Connector.receivers.github(client, subscribe, args)
                .then((arg) => {
                    assert.deepEqual(arg, {});
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });

    describe('#Gitlab()', function () {

        it('should return args object ', function (done) {

            const client = {service: 'gitlab', name: 'gitlab'},
                subscribe = {name: 'gitlab'},
                args = {};

            Connector.receivers.gitlab(client, subscribe, args)
                .then((arg) => {
                    assert.deepEqual(arg, {});
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });

    describe('#Http()', function () {

        it('should return args object ', function (done) {

            const client = {service: 'http', name: 'http'},
                subscribe = {name: 'http'},
                args = {};

            Connector.receivers.http(client, subscribe, args)
                .then((arg) => {
                    assert.deepEqual(arg, {});
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });
});