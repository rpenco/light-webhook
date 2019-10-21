const {Config} = require("./config");
module.exports.Cli = function () {
    return require('yargs')
        .usage('Usage: $0 -c [configuration]')
        .alias('c', 'config')
        .coerce('c', Config().read)
        .describe('c', 'Path to configuration file')
        .demandOption(['c'])
        .completion()
        .help('h')
        .alias('h', 'help')
        .detectLocale(false)
        .epilog("MIT")
        .parse();
};
