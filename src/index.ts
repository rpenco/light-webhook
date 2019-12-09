import {Webhook} from "./webhook/webhook";
import {Cli} from "./webhook/config/cli";
import {Log} from "./webhook/lib/log";

try {
    new Webhook()
        .configure(new Cli().parseArgs().getConfiguration())
        .start()
        .then(r => {
            process.on('SIGINT', () => r.stop());
        });
} catch (e) {
    Log.error(e.message);
    Log.debug(e);
    process.exit(1);
}