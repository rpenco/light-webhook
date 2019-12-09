import {describe} from "mocha";

const assert = require('assert');
const InlineArgs = require('../src/webhook/lib/inlineArgs');
const Templatizer = require('../src/webhook/lib/templatizer');

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


    describe('#Templatizer()', function () {
        it('should return string word', function () {
            assert.equal(Templatizer("hello {{a.b}}", {a: {b: 'c'}, d: 10}), 'hello c');
        });

        it('should return number word', function () {
            assert.equal(Templatizer("hello {{d}}", {a: {b: 'c'}, d: 10}), 'hello 10');
        });


        it('should return object word', function () {
            assert.equal(Templatizer("hello {{a}}", {a: {b: 'c'}, d: 10}), 'hello [object Object]');
        });

        it('should return stringify object', function () {
            assert.equal(Templatizer("hello {{a}}", {a: {b: 'c'}, d: 10}, {stringify: true}), 'hello {"b":"c"}');
        });

        it('should return undefined in inline dot notation', function () {
            assert.equal(Templatizer("hello {{e}}", {a: {b: 'c'}, d: 10}), 'hello undefined');
        });
    });
});