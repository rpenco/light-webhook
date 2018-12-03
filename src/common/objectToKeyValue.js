module.exports = function ObjectToKeyValue(obj, sep = ', ') {
    return Object.keys(obj).map(function (key, value) {
        const val = obj[key];
        return `${key}=${typeof val === 'string' ? `"${val}"` : val}`
    }).join(sep);
};

