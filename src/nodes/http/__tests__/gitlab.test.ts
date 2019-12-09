import * as superagent from "superagent";
import {expect} from "chai";
import {TopologyConfiguration} from "../../../webhook/config/configuration";
import {Webhook} from "../../../webhook/webhook";
import {ConfigurationBuilder} from "../../../webhook/config/configuration-builder";

describe('Gitlab', () => {
    it('should print "Hello world"', async () => {
        const pipeline: TopologyConfiguration = {
            name: "gitlab_push_pipeline_test",
            nodes: [
                {
                    name: "input_push",
                    settings: {
                        events: [
                            "Push Hook"
                        ],
                        token: "kdsodznvaz234rn"
                    },
                    type: "gitlab"
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

        try {

            const webhook = await new Webhook()
                .configure(
                    new ConfigurationBuilder()
                        .addPipeline(pipeline)
                        .build())
                .start();
            let response = await superagent
                .post('http://127.0.0.1:8111/gitlab_push_pipeline_test/input_push')
                .set('Content-Type', 'application/json')
                .set('X-Gitlab-Event', 'Push Hook')
                .send({
                    "object_kind": "push",
                    "before": "95790bf891e76fee5e1747ab589903a6a1f80f22",
                    "after": "da1560886d4f094c3e6c9ef40349f7d38b5d27d7",
                    "ref": "refs/heads/master",
                    "checkout_sha": "da1560886d4f094c3e6c9ef40349f7d38b5d27d7",
                    "user_id": 4,
                    "user_name": "John Smith",
                    "user_username": "jsmith",
                    "user_email": "john@example.com",
                    "user_avatar": "https://s.gravatar.com/avatar/d4c74594d841139328695756648b6bd6?s=8://s.gravatar.com/avatar/d4c74594d841139328695756648b6bd6?s=80",
                    "project_id": 15
                });

            expect(response.status).to.be.equal(200);
            expect(response.body).to.be.eqls({
                err: null,
                stdout: '{{headers.event}} {{body}}\n',
                stderr: '',
                code: 0
            });
            webhook.stop();
        } catch (e) {
            console.log(e);
            expect.fail();
        }


    });
});