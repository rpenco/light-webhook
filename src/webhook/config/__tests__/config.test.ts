import {expect} from 'chai';
import * as path from 'path';
import {Config} from "../config";

describe('Config', () => {

    it('should load github.yaml configuration', () => {
        const config = new Config()
            .read(path.join(__dirname, '../../../../docs/examples', 'github.yaml'));
        expect(config).to.eqls({
            hostname: "127.0.0.1",
            pipelines: [
                {
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
                                    "{{headers.event}} {{body}}"
                                ],
                                command: "echo",
                                pwd: "/tmp",
                                stringify: true
                            },
                            type: "bash"
                        }
                    ]
                }
            ],
            port: 8081,
            tls: {
                allowUnsigned: false,
                enable: false
            },
            uploadMaxSize: 0
        });
    });

    it('should load gitlab.yaml configuration', () => {
        const config = new Config()
            .read(path.join(__dirname, '../../../../docs/examples', 'gitlab.yaml'));
        expect(config).to.eqls({
                port: 8081,
                pipelines: [
                    {
                        name: "gitlab_pipeline",
                        nodes: [
                            {
                                name: "input_push",
                                type: "gitlab",
                                settings: {
                                    events: [
                                        "push",
                                        "merge_request"
                                    ]
                                }
                            },
                            {
                                name: "print",
                                type: "bash",
                                settings: {
                                    pwd: "/tmp",
                                    stringify: true,
                                    command: "echo",
                                    arguments: [
                                        "{{input.headers.event}} {{input.body}}"
                                    ]
                                }
                            }
                        ]
                    }
                ],
                hostname: "127.0.0.1",
                uploadMaxSize: 0,
                tls: {
                    enable: false,
                    allowUnsigned: false
                }
            }
        );
    });

    it('should load http.yaml configuration', () => {
        const config = new Config()
            .read(path.join(__dirname, '../../../../docs/examples', 'http.yaml'));
        expect(config).to.eqls({
                port: 8081,
                pipelines: [
                    {
                        name: "http_pipeline",
                        nodes: [
                            {
                                name: "input",
                                type: "http",
                                settings: {
                                    events: [
                                        "upload_event"
                                    ],
                                    max_upload_size: "5G"
                                }
                            },
                            {
                                name: "print",
                                type: "bash",
                                settings: {
                                    pwd: "/tmp",
                                    stringify: true,
                                    command: "echo",
                                    arguments: [
                                        "{{input.headers.event}} {{input.body}}"
                                    ]
                                }
                            }
                        ]
                    }
                ],
                hostname: "127.0.0.1",
                uploadMaxSize: 0,
                tls: {
                    enable: false,
                    allowUnsigned: false
                }
            }
        );
    });
});