const InlineArgs = require('../../common/inlineArgs');
const crypto = require('crypto');


module.exports = function GithubReceiver(client, subscription, event) {
    return new Promise(function (resolve, reject) {

        const {body, headers, params} = event;

        console.log(`[${client.name}][${subscription.name}] receive args: ${InlineArgs(headers)}`);

        if (!headers['user-agent'] || headers['user-agent'].indexOf('GitHub-Hookshot/') !== 0) {
            return reject('Github "user-agent" header is missing or malformed.');
        }

        if (!headers['x-github-delivery']) {
            return reject('Github "x-github-delivery" header is missing.');
        }

        if (!headers['x-github-event']) {
            return reject('Github "x-github-event" header is missing.');
        } else {
            if (subscription.settings.events !== '*' && subscription.settings.events.indexOf(headers['x-github-event']) === -1) {
                return reject('Github "x-github-event" header is not triggered.');
            }
        }

        if (!headers['x-hub-signature']) {
            return reject('Github "x-hub-signature" header is missing or malformed.');
        } else {
            if (subscription.settings.secret) {
                const shasum = crypto.createHash('sha1');
                const token = headers['x-hub-signature'].substr(0, 'sha1='.length);
                shasum.update(token);
                if (shasum.digest('hex') !== subscription.settings.secret) {
                    console.log(`[${client.name}][${subscription.name}] has invalid token: token="${token}"`);
                    return reject('Github "x-hub-signature" header has invalid token.');
                }
            }
        }

        return resolve(args);
    });
};
