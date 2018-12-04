const crypto = require('crypto');


module.exports = function HTTPReceiver(client, subscription, event) {
    return new Promise(function (resolve, reject) {

        const {body, headers, params} = event;

        if (!headers['x-webhook-event']) {
            return reject('Webhook "x-webhook-event" header is missing.');
        } else {
            if (subscription.settings.events.indexOf('*') === -1 && subscription.settings.events.indexOf(headers['x-webhook-event']) === -1) {
                return reject('Webhook "x-webhook-event" header is not triggered.');
            }
        }

        if (subscription.settings.secret !== false && !headers['x-webhook-signature']) {
            return reject('Webhook "x-webhook-signature" header is missing or malformed.');
        } else {
            if (subscription.settings.secret !== undefined && subscription.settings.secret !== false ) {
                const signature = headers['x-webhook-signature'].substr('sha1='.length);
                const shasum = crypto.createHash('sha1').update(subscription.settings.secret).digest('hex');

                if (shasum !== signature) {
                    console.log(`[${client.name}][${subscription.name}] has invalid token: signature="${signature}" shasum="${shasum}"`);
                    return reject('Webhook "x-webhook-signature" header has invalid signature.');
                }
            }
        }

        return resolve(event);
    });
};
