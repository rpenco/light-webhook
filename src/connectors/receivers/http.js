const InlineArgs = require('../../common/inlineArgs');

module.exports = function connector(client, subscribe, args) {

    return new Promise(function (resolve, reject) {
        console.log(`[${client.name}][${subscribe.name}] receive args ${InlineArgs(args)}`);
        return resolve(args);
    });
};
