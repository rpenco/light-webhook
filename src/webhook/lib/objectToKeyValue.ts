/**
 * Convert an object to a string formatted key=value
 * @param obj
 * @param sep separator, default: ', '
 * @constructor
 */
export function ObjectToKeyValue(obj: object, sep: string = ', '): string {
    return Object.keys(obj).map(function (key, value) {
        const val = obj[key];
        return `${key}=${typeof val === 'string' ? `"${val}"` : val}`
    }).join(sep);
}

