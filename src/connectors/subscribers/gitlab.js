
module.exports = function GitlabSubscriber(client, subscription, event) {
    return new Promise(function (resolve, reject) {

        const {body, headers, params} = event;

        if (!headers['x-gitlab-event']) {
            return reject('Gitlab "x-gitlab-event" header is missing.');
        } else {
            if (subscription.settings.events.indexOf('*') === -1 && subscription.settings.events.indexOf(body.event_name) === -1) {
                return reject('Gitlab "x-github-event" header is not triggered.');
            }
        }
        
        return resolve(event);
    });
};
