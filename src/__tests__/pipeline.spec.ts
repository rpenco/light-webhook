import {expect} from 'chai';
import * as path from 'path';
import {IStreamContext, Stream} from "../stream";
import {StreamConfiguration} from "../../config/webHookConfiguration";
import {Registry} from "../../../nodes/register";
import express from "express";

describe('Pipeline', () => {

    it('should load pipeline', () => {
        const configuration: StreamConfiguration = {
            name: "github_push_pipeline",
            nodes: [
                {
                    name: "input_push",
                    settings: {
                        events: [
                            "push"
                        ],
                        signature: "kdsodznvaz234rn"
                    },
                    type: "github"
                },
                {
                    name: "execute_push",
                    settings: {
                        arguments: [
                            "{{ stringify(options) /}}"
                        ],
                        command: "echo",
                        pwd: "/tmp"
                    },
                    type: "bash"
                }
            ]
        };

        const context: IStreamContext = {logger: console, server: express()};
        const pipeline = new Stream(configuration, Registry, context)
            .build();
        expect(pipeline.name).to.equals('github_push_pipeline');
        expect(pipeline.nodes).to.have.lengthOf(2);
    });
});