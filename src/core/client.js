const InlineArgs = require('../common/inlineArgs');

module.exports = function Client(name, options) {

    console.log(`[${name}] client configuration: ${InlineArgs(options)}`);

    const {subscribe, publish, settings} = options;

    if (!subscribe || subscribe.length == 0) {
        console.warn(`[${name}] client has not subscription!`);
        return;
    }

    if (!publish || publish.length == 0) {
        console.warn(`[${name}] client has not publication!`);
        return;
    }

    return {
        name,
        ...options
    }
};
