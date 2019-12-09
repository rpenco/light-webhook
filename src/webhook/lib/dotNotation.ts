export function DotNotation(obj, target, prefix) {
    target = target || {};
    prefix = prefix || "";

    if (obj && Object.keys(obj)) {
        Object.keys(obj).forEach(function (key) {
            if (typeof (obj[key]) === "object") {
                DotNotation(obj[key], target, prefix + key + ".");
            } else {
                return target[prefix + key] = obj[key];
            }
        });
    }
    return target;
}
