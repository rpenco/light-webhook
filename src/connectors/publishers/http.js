const http = require('light-http');
const Templatizer = require('../../common/templatizer');

/**
 *
 * "settings": {
 *     "method": "GET" or "POST", "PUT", "DELETE",
 *     "url": "http://myotherservice.com",
 *     "params": {"key": "value"},
 *     "body": "In case of POST/PUT",
 *     "headers": {"user-agent": "Mozilla/5.0 xx"}
 * }
 */
module.exports = function HTTPPublisher(client, publish, subscribe, event) {

    return new Promise(function (resolve, reject) {

        const settings = publish.settings;
        const method = settings.method.toLocaleLowerCase();
        const opt = {stringify: !!settings.stringify};

        const url = Templatizer(settings.url, event, opt);

        let params = {};
        if (settings.params) {
            const keys = Object.keys(settings.params);
            keys.forEach((key) => {
                params[Templatizer(key, event, opt)] = Templatizer(settings.params[key], event, opt)
            });
        }

        let headers = {};
        if (settings.headers) {
            const keys = Object.keys(settings.headers);
            keys.forEach((key) => {
                headers[Templatizer(key, event, opt)] = Templatizer(settings.headers[key], event, opt)
            });
        }

        http[method](url, params, headers, function (response) {
            resolve(response)
        });

    });
};
