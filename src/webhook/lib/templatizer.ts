const {Log} = require('./log');

/**
 * Replace keywords between brackets by its value.
 *
 * @example
 *  Replace text 'hello {{body.myworld}}' by 'hello world' with objKeys={ body : { myworld : "world" }}
 * @param text
 * @param objKeys
 * @param options {stringify} apply a JSON.stringify on object to get value instead of display default toString [Object]
 * @return string
 */
export function Templatizer(text: string, objKeys, options) {

    const stringify = options && options.stringify ? !!options.stringify : false;

    return text && typeof text === 'string' ? text.replace(/{{.*?}}/g, (val) => {
        const key = val.substr(2, val.length - 4).split('.');

        let tmp = objKeys;
        key.forEach((k) => {
            const value = tmp[k];
            if (typeof value === 'object') {
                try {
                    tmp = stringify ? JSON.stringify(value) : value;
                } catch (e) {
                    Log.error(`[Templatizer] failed to stringify object: ${value}`);
                    return undefined;
                }
            } else {
                if (value === undefined) {
                    Log.error(`[Templatizer] failed to templating ${val}. '${k}' is undefined.`);
                    return undefined;
                }
                tmp = value;
            }
        });
        return tmp;
    }) : text;
}


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