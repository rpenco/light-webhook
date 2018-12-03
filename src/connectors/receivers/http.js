const InlineArgs = require('../../common/inlineArgs');

/**
 * Simple HTTP client.
 *
 * @param client
 * @param subscribe
 * @param args
 * @returns {Promise<any>}
 */
module.exports = function connector(client, subscribe, args) {

    return new Promise(function (resolve, reject) {
        const settings = subscribe.settings;
        console.log(`[${client.name}][${subscribe.name}] (${settings.method}) receive args: ${InlineArgs(args)}`);
        return resolve(args);
    });
};
