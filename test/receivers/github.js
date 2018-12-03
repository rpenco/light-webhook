const assert = require('assert');
const Connector = require('../../src/connectors/receivers/github');

describe('Connectors - Receivers - Github', function () {

    describe('Receive an Github POST', function () {

        it('should return args', function (done) {

            const args = {
                body: {
                    "action": "opened",
                    "issue": {
                        "url": "https://api.github.com/repos/octocat/Hello-World/issues/1347",
                        "number": 1347,
                        //...
                    },
                    "repository": {
                        "id": 1296269,
                        "full_name": "octocat/Hello-World",
                        "owner": {
                            "login": "octocat",
                            "id": 1,
                            //...
                        },
                        //...
                    },
                    "sender": {
                        "login": "octocat",
                        "id": 1,
                        //...
                    }
                },
                headers: {
                    'User-Agent': 'GitHub-Hookshot/213489',
                    'X-GitHub-Delivery': '123456-0ac9-90e5-8e18-1234567',
                    'X-GitHub-Event': 'issues',
                    'X-Hub-Signature': 'sha1=1234567890123456789123456789012345678912',
                    'Content-Type': 'application/json'
                },
                params: {'p': 'val'}
            };
            const subscribe = {name: 'http', settings: {secret: 'mysecret', events: ['']}};
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