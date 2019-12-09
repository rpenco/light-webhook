import {Config} from "./config";
import yargs from "yargs";
import {Configuration} from "./configuration";

export class Cli {

    private args;

    /**
     * Parse command arguments
     * @returns Configuration object
     */
    parseArgs(): Cli {
        const config = new Config();

        this.args = yargs
            .usage('Usage: $0 -c [configuration file]')
            .alias('c', 'config')
            .coerce('c', config.read)
            .describe('c', 'Path to configuration file')
            .demandOption(['c'])
            .completion()
            .help('h')
            .alias('h', 'help')
            .detectLocale(false)
            .epilog(`
        MIT
        Source: https://github.com/rpenco/light-webhook
        Version 2.0.0
        `).parse() as any;

        return this;
    }

    getConfiguration(): Configuration {
        return this.args.config;
    }
}
