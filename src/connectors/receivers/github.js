const crypto = require('crypto');


module.exports = function GithubReceiver(client, subscription, event) {
    return new Promise(function (resolve, reject) {

        const {body, headers, params} = event;

        if (!headers['user-agent'] || headers['user-agent'].indexOf('GitHub-Hookshot/') !== 0) {
            return reject('Github "user-agent" header is missing or malformed.');
        }

        if (!headers['x-github-delivery']) {
            return reject('Github "x-github-delivery" header is missing.');
        }

        if (!headers['x-github-event']) {
            return reject('Github "x-github-event" header is missing.');
        } else {
            if (subscription.settings.events.indexOf('*') === -1 && subscription.settings.events.indexOf(headers['x-github-event']) === -1) {
                return reject('Github "x-github-event" header is not triggered.');
            }
        }

        if (!headers['x-hub-signature']) {
            return reject('Github "x-hub-signature" header is missing or malformed.');
        } else {
            if (subscription.settings.secret && subscription.settings.secret !== false) {
                const signature = headers['x-hub-signature'].substr('sha1='.length);
                const shasum = crypto.createHash('sha1').update(subscription.settings.secret).digest('hex');

                if (shasum !== signature) {
                    console.log(`[${client.name}][${subscription.name}] has invalid token: signature="${signature}" shasum="${shasum}"`);
                    return reject('Github "x-hub-signature" header has invalid signature.');
                }
            }
        }

        return resolve(event);
    });
};
