const crypto = require('crypto');
const {Log} = require('../../common/log');

module.exports = function HTTPSubscriber(client, subscription, event) {
    return new Promise(function (resolve, reject) {
        Log.info(`[${client.name}][${subscription.name}] receive HTTP request`);
        const {body, headers, params} = event;

        if (!headers['x-webhook-event']) {
            Log.error(`[${client.name}][${subscription.name}] "x-webhook-event" header is missing.`);
            return reject('Webhook "x-webhook-event" header is missing.');
        } else {
            if (subscription.settings.events.indexOf('*') === -1 && subscription.settings.events.indexOf(headers['x-webhook-event']) === -1) {
                Log.error(`[${client.name}][${subscription.name}] "x-webhook-event" header is not triggered.`);
                return reject('Webhook "x-webhook-event" header is not triggered.');
            }
        }

        if (subscription.settings.secret !== false && !headers['x-webhook-signature']) {
            Log.error(`[${client.name}][${subscription.name}] "x-webhook-signature" header is missing or malformed.`);
            return reject('Webhook "x-webhook-signature" header is missing or malformed.');
        } else {
            if (subscription.settings.secret !== undefined && subscription.settings.secret !== false) {
                const algo = "sha1";
                const signature = headers['x-webhook-signature'].substr(`${algo}=`.length);
                const secret = subscription.settings.secret;
                const shasum = crypto.createHash(algo)
                    .update(secret)
                    .digest('hex');

                if (shasum !== signature) {
                    Log.error(`[${client.name}][${subscription.name}] has invalid token: actual="${signature}" expected="${shasum}"`);
                    return reject('Webhook "x-webhook-signature" header has invalid signature.');
                }
            }
        }

        Log.debug(`[${client.name}][${subscription.name}] resolved."`);
        return resolve(event);
    });
};
