import {expect} from 'chai';
import * as path from 'path';
import {Config} from "../config";

describe('Config', () => {

    it('should load github.yaml configuration', () => {
        const config = new Config()
            .read(path.join(__dirname, '../../../../examples/github', 'github.yaml'));
        expect(config).to.eqls({
            hostname: "127.0.0.1",
            logger: {
                files: [],
                level: 'info',
                meta: {}
            },
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
                                    "{{ stringify(options) /}}"
                                ],
                                command: "echo",
                                pwd: "/tmp"
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
            .read(path.join(__dirname, '../../../../examples/gitlab', 'gitlab.yaml'));
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
                                    command: "echo",
                                    arguments: [
                                        "{{ stringify(options) /}}"
                                    ]
                                }
                            }
                        ]
                    }
                ],
                hostname: "127.0.0.1",
                uploadMaxSize: 0,
                logger: {
                    files: [],
                    level: 'info',
                    meta: {}
                },
                tls: {
                    enable: false,
                    allowUnsigned: false
                }
            }
        );
    });

    it('should load http.yaml configuration', () => {
        const config = new Config()
            .read(path.join(__dirname, '../../../../examples/http', 'http.yaml'));
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
                                    ]
                                }
                            },
                            {
                                name: "print",
                                type: "bash",
                                settings: {
                                    pwd: "/tmp",
                                    command: "echo",
                                    arguments: [
                                        "{{ headers['content-type'] }}"
                                    ]
                                }
                            }
                        ]
                    }
                ],
                hostname: "127.0.0.1",
                uploadMaxSize: 0,
                logger: {
                    files: [],
                    level: 'info',
                    meta: {}
                },
                tls: {
                    enable: false,
                    allowUnsigned: false
                }
            }
        );
    });
});