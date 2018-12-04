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
module.exports = function Templatizer(text, objKeys, options) {

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
                    tmp = undefined;
                    console.error(`[Templatizer] failed to stringify object: ${value}`)
                }
            } else {
                tmp = value;
            }
        });
        return tmp;
    }) : text;
};