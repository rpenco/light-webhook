import * as superagent from "superagent";
import {expect} from "chai";
import {TopologyConfiguration} from "../../../webhook/config/configuration";
import {Webhook} from "../../../webhook/webhook";
import {ConfigurationBuilder} from "../../../webhook/config/configuration-builder";
import * as path from "path";
import * as fs from "fs";

describe('Http', () => {
    it('should print "Hello world"', async () => {
        const pipeline: TopologyConfiguration = {
            name: "http_pipeline_test",
            nodes: [
                {
                    name: "input_push",
                    settings: {
                        events: [
                            "my_event"
                        ],
                        signature: "kdsodznvaz234rn"
                    },
                    type: "http"
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
                .post('http://127.0.0.1:8111/http_pipeline_test/input_push')
                .set('Content-Type', 'application/json')
                .set('X-Webhook-Event', 'my_event')
                .send({
                    "hello": "world"
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

    it('should display multipart/form-data', async () => {
        const pipeline: TopologyConfiguration = {
            name: "http_pipeline_test",
            nodes: [
                {
                    name: "input_push",
                    settings: {
                        events: [
                            "my_event"
                        ],
                        signature: "kdsodznvaz234rn"
                    },
                    type: "http"
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
                .post('http://127.0.0.1:8111/http_pipeline_test/input_push')
                .set('Content-Type', 'multipart/form-data')
                .set('X-Webhook-Event', 'my_event')
                .field('hello', 'Hi')
                .field('world', 'you!')
                .attach('license', fs.createReadStream(path.join(__dirname, '../../../../', 'LICENSE')));

            expect(response.status).to.be.equal(200);
            expect(response.body).to.be.eqls({ hello: 'Hi', world: 'you!' });
            webhook.stop();
        } catch (e) {
            console.log(e);
            expect.fail();
        }
    });
});