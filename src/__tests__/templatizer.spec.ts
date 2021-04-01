import {expect} from 'chai';
import {Templatizer} from "../lib";
import {AnyRecord} from "../api";

describe('Templatizer', () => {

    it('should stringify Record', () => {
        const record = new AnyRecord({hello: "world"});
        // .setId("1")
        // .setFiles({"myFile": { size: 10}})
        // .setHeaders({"content-type": "application/json"}))

        const output = Templatizer.compile(`{{@stringify(it)/}}`, record.data());
        expect(output).to.equal('{"params":[{"hello":"world"}]}');
        // expect()
            // .to.equal('{"headers":{"content-type":"application/json"},"context":{},"files":{"myFile":{"size":10}},"id":"1","data":{"hello":"world"}}');
            // .to.equal('{"headers":{"content-type":"application/json"},"context":{},"files":{"myFile":{"size":10}},"id":"1","data":{"hello":"world"}}');
    });

    it('should stringify Record item', () => {

        const record = new AnyRecord({hello: "world"});
        expect(Templatizer.compile(`{{it._data.hello}}`, record)).to.equal('world');
    });
});