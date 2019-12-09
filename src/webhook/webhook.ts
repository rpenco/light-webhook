import Express, {Application} from "express";
import bodyParser from "body-parser";
import https from "https";
import http, {Server} from "http";
import fs from "fs";
import {Configuration} from "./config/configuration";

import busboy from "connect-busboy";
import {Log} from "./lib/log";
import {IPipelineContext, Pipeline} from "./pipeline/pipeline";
import {RegisteredNodes} from "../nodes/register";

export class Webhook {
    private application: Application;
    private server: Server;
    private configuration: Configuration;
    private pipelines: Pipeline[] = [];

    /**
     * Configure the application
     * @param configuration
     */
    public configure(configuration: Configuration) {
        Log.debug(`Application environment variables:`, process.env);
        this.configuration = configuration;
        return this;
    }

    /**
     * Start the application
     */
    public start(): Promise<Webhook> {
        Log.debug(`Starting application...`);
        return this.initializeServer()
            .then(this.initializePipelines.bind(this))
            .then(this.listen.bind(this))
            .then(() => {
                Log.info(`Application started.`);
                return this;
            });
    }

    /**
     * Stop the application
     */
    public stop(): Promise<Webhook> {
        return new Promise((resolve) => {
            Log.debug(`Stopping application...`);
            this.server.close();
            // TODO chain stop and resolve after
            this.pipelines.forEach((topology) => topology.stop());
            Log.info(`Application stopped.`);
            resolve(this)
        });
    }

    /**
     * Initialize Http server (Express)
     */
    private initializeServer(): Promise<void> {
        return new Promise((resolve) => {
            this.application = Express();
            this.application.use(bodyParser.json());
            this.application.use(bodyParser.urlencoded({extended: true}));
            this.application.use(busboy());
            this.application.use((req, res, next) => {
                Log.debug(`${req.method} ${req.protocol}://${req.hostname}:${this.configuration.port}${req.url}`);
                next();
            });
            resolve();
        });
    }

    /**
     * Initialize all pipelines.
     */
    private initializePipelines(): Promise<void> {
        for (const name of Object.keys(this.configuration.pipelines)) {
            let context = <IPipelineContext>{
                server: this.application,
                logger: Log
            };
            // TODO chain them and resolve after all started
            this.pipelines.push(new Pipeline(this.configuration.pipelines[name], RegisteredNodes, context)
                .build().start());
        }
        return Promise.resolve();
    }

    /**
     * Listen application
     */
    private listen(): Promise<void> {
        let server: any;
        if (this.configuration.tls.enable === true) {
            Log.debug("Create a https (SSL) server.");
            server = https.createServer({
                key: fs.readFileSync(this.configuration.tls.key),
                cert: fs.readFileSync(this.configuration.tls.cert),
                passphrase: this.configuration.tls.passphrase
            }, this.application);
        } else {
            Log.debug("Create a http server.");
            server = http.createServer(this.application);
        }

        return new Promise((resolve) => {
            this.server = server.listen(this.configuration.port, this.configuration.hostname, () => {
                const baserUrl = `${this.configuration.tls.enable ? 'https' : 'http'}://${server.address().address}:${server.address().port}`;
                this.application._router.stack.filter(r => r.route)
                    .map(route => {
                        Log.debug(`URL endpoint: [${Object.keys(route.route.methods).join(',')}] ${baserUrl}${route.route.path}`);
                    });
                Log.info(`Application listening on ${baserUrl}`);
                resolve();
            });
        });

    }
}
