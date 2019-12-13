import {Webhook} from "./webhook/webhook";
import {Cli} from "./webhook/config/cli";
import {Log} from "./webhook/lib/log";

try {
    const configuration = new Cli().parseArgs().getConfiguration();
    Log.reload(configuration.logger);

    new Webhook()
        .configure(configuration)
        .start()
        .then(r => {
            process.on('SIGINT', () => r.stop());
            // process.on('uncaughtException', (err: any) => {
            //     if (err.errno === 'EADDRINUSE') {
            //         Log.error(err.message);
            //         process.exit(1);
            //     } else {
            //         Log.error(`UncaughtException: ${err.message}`);
            //         Log.debug(err);
            //     }
            //     process.exit(1);
            // });
        });
} catch (e) {
    Log.error(e.message);
    Log.debug(e);
    process.exit(1);
}