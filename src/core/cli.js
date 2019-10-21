module.exports = function () {
    const argv = require('yargs')
        .option('config')
        .coerce('config', function (arg) {
            let file = require('fs').readFileSync(arg, 'utf8');
            file = JSON.parse(file);

            return file;
        })
        .demandOption('config')
        .string('config')
        .completion()
        .describe('config', 'Path to configuration file')

        .option('port')
        .number('port')
        .describe('port', 'server port')
        .default('port', 8080)

        .help('help')
        .detectLocale(false)
        .parse();

    const config = argv.config;
    if (!config || Object.keys(config).length === 0) {
        console.warn('empty configuration.');
        process.exit(1);
    }
    return argv;
};
