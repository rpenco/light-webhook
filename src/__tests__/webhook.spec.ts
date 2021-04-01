import * as superagent from "superagent";
import {expect} from "chai";
import {Configuration, StreamConfiguration} from "../api";
import {Webhook} from "../lib/webhook";

describe('Light Webhook', () => {
    xit('should print "Hello world"', async () => {
        const configuration: Configuration = {
            name: 'test',
            stream: [
                {
                    name: "input_push",
                    settings: {
                        events: [
                            "issues"
                        ],
                        signature: "kdsodznvaz234rn"
                    },
                    type: "github-source"
                },
                {
                    name: "execute_push",
                    settings: {
                        arguments: [
                            "{{ headers['x-github-delivery'] }}"
                        ],
                        command: "echo",
                        pwd: "/tmp"
                    },
                    type: "bash-sink"
                }
            ]
        };

        const webhook = await new Webhook(configuration);
        webhook.start();

        let response = await superagent
            .post('http://127.0.0.1:8111/github_push_pipeline/input_push')
            .set('X-GitHub-Delivery', '72d3162e-cc78-11e3-81ab-4c9367dc0958')
            .set('X-Hub-Signature', 'sha1=7d38cdd689735b008b3c702edd92eea23791c5f6')
            .set('User-Agent', 'GitHub-Hookshot/044aadd')
            .set('Content-Type', 'application/json')
            .set('X-GitHub-Event', 'issues')
            .send({
                repository: {
                    id: 1296269,
                    full_name: "octocat/Hello-World",
                    owner: {
                        login: "octocat",
                        id: 1,
                    },
                }
            });

        expect(response.status).to.be.equal(200);
        expect(response.body).to.be.eqls({
            err: null,
            stdout: "72d3162e-cc78-11e3-81ab-4c9367dc0958\n",
            stderr: '',
            code: 0
        });
        webhook.stop();
    });
});