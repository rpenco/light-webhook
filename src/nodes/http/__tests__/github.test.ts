import * as superagent from "superagent";
import {expect} from "chai";
import {TopologyConfiguration} from "../../../webhook/config/configuration";
import {Webhook} from "../../../webhook/webhook";
import {ConfigurationBuilder} from "../../../webhook/config/configuration-builder";

describe('Github', () => {
    it('should print "Hello world"', async () => {
        const pipeline: TopologyConfiguration = {
            name: "github_push_pipeline_test",
            nodes: [
                {
                    name: "input_push",
                    settings: {
                        events: [
                            "issues"
                        ],
                        signature: "kdsodznvaz234rn"
                    },
                    type: "github"
                },
                {
                    name: "execute_push",
                    settings: {
                        arguments: [
                            "{{headers.event}} {{body}}"
                        ],
                        command: "echo",
                        pwd: "/tmp",
                        stringify: true
                    },
                    type: "bash"
                }
            ]
        };

        try{

            const webhook = await new Webhook()
                .configure(
                    new ConfigurationBuilder()
                        .addPipeline(pipeline)
                        .build())
                .start();
            let response = await superagent
                .post('http://127.0.0.1:8111/github_push_pipeline_test/input_push')
                .set('X-GitHub-Delivery', '72d3162e-cc78-11e3-81ab-4c9367dc0958')
                .set('X-Hub-Signature', 'sha1=7d38cdd689735b008b3c702edd92eea23791c5f6')
                .set('User-Agent', 'GitHub-Hookshot/044aadd')
                .set('Content-Type', 'application/json')
                .set('X-GitHub-Event', 'issues')
                .send({
                    action: "opened",
                    issue: {
                        url: "https://api.github.com/repos/octocat/Hello-World/issues/1347",
                        number: 1347,
                    },
                    repository: {
                        id: 1296269,
                        full_name: "octocat/Hello-World",
                        owner: {
                            login: "octocat",
                            id: 1,
                        },
                    },
                    sender: {
                        login: "octocat",
                        id: 1,
                    }
                });

            expect(response.status).to.be.equal(200);
            expect(response.body).to.be.eqls({
                err: null,
                stdout: '{{headers.event}} {{body}}\n',
                stderr: '',
                code: 0
            });
            webhook.stop();
        }catch (e) {
            console.log(e);
            expect.fail();
        }


    });
});