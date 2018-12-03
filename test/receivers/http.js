const assert = require('assert');
const Connector = require('../../src/connectors/receivers/http');

describe('Connectors - Receivers - Http', function () {

    describe('Receive an HTTP POST', function () {

        it('should return args ', function (done) {

            const args = {body: undefined, headers: {'header': 'value'}, params: {'p':'val'}};
            const subscribe = {name: 'http', settings: {method: 'GET'}};
            const client = {subscribe: [subscribe], name: 'client1'};

            Connector(client, subscribe, args)
                .then((arg) => {
                    assert.deepEqual(arg, args);
                })
                .then(done)
                .catch(assert.fail)
                .catch(done)
        });
    });
});