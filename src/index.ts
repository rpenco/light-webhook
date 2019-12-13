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
        });
} catch (e) {
    Log.error(e.message);
    Log.debug(e);
    process.exit(1);
}