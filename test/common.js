const assert = require('assert');
const InlineArgs = require('../src/common/inlineArgs');

describe('Common', function () {
    describe('#ObjectToKeyValue()', function () {
        it('should return object in inline dot notation', function () {
            assert.equal(InlineArgs({a: {b: 'c'}, d: 10}), 'a.b="c", d=10');
        });

        it('should return null in inline dot notation', function () {
            assert.equal(InlineArgs(null), '');
        });

        it('should return undefined in inline dot notation', function () {
            assert.equal(InlineArgs(undefined), '');
        });
    });
});