var http = require('light-http');

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
module.exports = function connector(client, publish, args) {

    return new Promise(function (resolve, reject) {

        const settings = publish.settings;
        const method = settings.method.toLocaleLowerCase();

        // TODO parse url
        const url = settings.url;

        // TODO parse params
        const params = settings.params;

        // TODO parse headers
        const headers = settings.headers;

        http[method](url, params, header, function (response) {
            resolve(response)
        });

    });
};
