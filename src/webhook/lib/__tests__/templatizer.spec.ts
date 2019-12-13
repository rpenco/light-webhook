import {expect} from 'chai';
import {Templatizer} from "../templatizer";
import {Tuple} from "../../tuple/tuple";

describe('Templatizer', () => {

    it('should stringify Tuple', () => {
        expect(Templatizer.compile(`{{stringify(options)/}}`, new Tuple()
            .setId("1")
            .setFiles({"myFile": { size: 10}})
            .setData({hello: "world"})
            .setHeaders({"content-type": "application/json"})))
            .to.equal('{"headers":{"content-type":"application/json"},"context":{},"files":{"myFile":{"size":10}},"id":"1","data":{"hello":"world"}}');
    });

    it('should stringify Tuple item', () => {
        expect(Templatizer.compile(`{{data.hello}}`, new Tuple()
            .setId("1")
            .setFiles({"myFile": { size: 10}})
            .setData({hello: "world"})
            .setHeaders({"content-type": "application/json"})))
            .to.equal('world');
    });
});