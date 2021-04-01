import {expect} from "chai";
import {BashNode} from "../s3-sink";
import Joi from "joi";
import {Record} from "../../../lib/record/record";
import * as path from "path";

xdescribe('S3 (require active s3 backend)', () => {

    it('should print stringified record object', (done) => {
        let bashNode = new BashNode('bash_test');
        const conf = {
            endPoint: "127.0.0.1",
            port: 9000,
            useSSL: false,
            accessKey: "RD9TDM61HVMH7U11YP8P",
            secretKey: "YlJnZtYpuAfirKeSbI8bX6zqzud1LBcTjqEniFnX",
            bucketName: 'bob'
        };

        const {error, value} = bashNode.validate(Joi).validate(conf);
        if (error) {
            console.error(error);
            expect.fail('Failed to validate S3 node configuration')
        }

        const file1 = {
            filename: 'LICENSE',
            path: path.join(__dirname, '../../../../', 'LICENSE')
        };

        bashNode.prepare(value, null).pipe(
            a => bashNode.execute(new Record().setId('1')
                .setFiles([file1])
                .setData({hello: {world: 1}}))
        ).subscribe(record => {
            expect(record.getData()).to.have.lengthOf(1);
            expect(record.getData()[0].bucketName).to.be.a('string');
            expect(record.getData()[0].objectName).to.equal('LICENSE');
            expect(record.getData()[0].region).to.be.a('string');
            done();
        })
    });
});