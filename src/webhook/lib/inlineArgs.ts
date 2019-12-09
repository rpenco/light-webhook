const DotNotation = require('./dotNotation');
const ObjectToKeyValue = require('./objectToKeyValue');

module.exports = function InlineArgs(obj) {
    return ObjectToKeyValue(DotNotation(obj));
};
