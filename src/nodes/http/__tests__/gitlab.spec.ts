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
                    "after": "da1560886d4f094c3e6c9ef40349f7d38b5d27d7"
                });

            expect(response.status).to.be.equal(200);
            expect(response.body).to.be.eqls({
                object_kind: 'push',
                before: '95790bf891e76fee5e1747ab589903a6a1f80f22',
                after: 'da1560886d4f094c3e6c9ef40349f7d38b5d27d7'
            });
            webhook.stop();
        } catch (e) {
            console.log(e);
            expect.fail();
        }


    });
});