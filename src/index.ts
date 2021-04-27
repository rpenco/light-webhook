#!/usr/bin/env node
import {Webhook} from "./lib/webhook";
import {Cli} from "./lib/cli";
import {Log} from "./lib/log";

try {
    const configuration = new Cli().parseArgs().getConfiguration();
    Log.reload(configuration.logger);

    const wh = new Webhook(configuration);

    wh.start().subscribe(
        () => {
            Log.info("stream started...");
        }, () => {
            Log.error("failed to start")
        });

    process.on('SIGTERM', ()=> wh.stop());
    process.on('SIGINT', ()=> wh.stop());
    process.on('uncaughtException', (err: any) => {
        if (err.errno === 'EADDRINUSE') {
            Log.error(err.message);
            process.exit(1);
        } else {
            Log.error(`UncaughtException: ${err.message}`);
            Log.debug(err);
        }
        process.exit(1);
    });

} catch (e) {
    Log.error(e.message);
    Log.debug(e);
    process.exit(1);
}