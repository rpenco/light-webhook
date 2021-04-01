import {expect} from 'chai';
import {StreamConfiguration} from "../api";
import {IStreamContext, Stream} from "../lib/stream";

describe('Stream', () => {

    it('should load stream', () => {
        const configuration: StreamConfiguration =
             [
                {
                    name: "input_push",
                    type: "github-source",
                    settings: {
                        events: [
                            "push"
                        ],
                        signature: "kdsodznvaz234rn"
                    },
                    out: ["execute_push"]
                },
                {
                    name: "execute_push",
                    type: "bash-sink",
                    settings: {
                        arguments: [
                            "{{ stringify(options) /}}"
                        ],
                        command: "echo",
                        pwd: "/tmp"
                    }
                }
            ];

        const context: IStreamContext = {
            name: "",
            nodes: configuration,
            logger: console
            // configuration, Registry,
        };
        const pipeline = new Stream(context).build();
        expect(pipeline.nodes).to.have.lengthOf(2);
    });
});