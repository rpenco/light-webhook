const InlineArgs = require('../common/inlineArgs');

module.exports = function Client(name, options) {

    console.log(`${(new Date()).toISOString()} [${name}] client configuration: ${InlineArgs(options)}`);

    const {subscribe, publish, settings} = options;

    if (!subscribe || subscribe.length === 0) {
        console.warn(`${(new Date()).toISOString()} [${name}] client has not subscription!`);
        return;
    }

    if (!publish || publish.length === 0) {
        console.warn(`${(new Date()).toISOString()} [${name}] client has not publication!`);
        return;
    }

    return {
        name,
        ...options
    }
};
