import {expect} from 'chai';
import {Templatizer} from "../templatizer";
import {Record} from "../../record/record";

describe('Templatizer', () => {

    it('should stringify Record', () => {
        expect(Templatizer.compile(`{{stringify(options)/}}`, new Record()
            .setId("1")
            .setFiles({"myFile": { size: 10}})
            .setData({hello: "world"})
            .setHeaders({"content-type": "application/json"})))
            .to.equal('{"headers":{"content-type":"application/json"},"context":{},"files":{"myFile":{"size":10}},"id":"1","data":{"hello":"world"}}');
    });

    it('should stringify Record item', () => {
        expect(Templatizer.compile(`{{data.hello}}`, new Record()
            .setId("1")
            .setFiles({"myFile": { size: 10}})
            .setData({hello: "world"})
            .setHeaders({"content-type": "application/json"})))
            .to.equal('world');
    });
});