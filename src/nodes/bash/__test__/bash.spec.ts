import {expect} from "chai";
import {BashNode} from "../bash";
import Joi from "@hapi/joi";
import {Tuple} from "../../../webhook/tuple/tuple";


describe('Bash', () => {

    it('should print stringified tuple object', (done) => {
        let bashNode = new BashNode('bash_test');
        const conf = {
            pwd: __dirname,
            command: 'echo',
            arguments: ['{{stringify(options)/}}'],
            environments: []
        };

        const {error, value} = bashNode.validate(Joi).validate(conf);
        if (error) {
            console.error(error);
            expect.fail('Failed to validate Bash node configuration')
        }

        bashNode.prepare(value, null).pipe(
            a => bashNode.execute(new Tuple().setId('1').setData({hello: {world: 1}}))
        ).subscribe(tuple => {
            expect(tuple.getData()).to.be.eqls({
                err: null,
                stdout: '{headers:{},context:{},files:{},id:1,data:{hello:{world:1}}}\n',
                stderr: '',
                code: 0
            });
            done();
        })
    });

    it('should print specific tuple value', (done) => {
        let bashNode = new BashNode('bash_test');
        const conf = {
            pwd: __dirname,
            command: 'echo',
            arguments: ['{{ headers["content-type"] }}'],
            environments: []
        };

        const {error, value} = bashNode.validate(Joi).validate(conf);
        if (error) {
            console.error(error);
            expect.fail('Failed to validate Bash node configuration')
        }

        bashNode.prepare(value, null).pipe(
            a => bashNode.execute(new Tuple().setId('1').setHeaders({'content-type': 'application/json'}).setData({hello: {world: 1}}))
        ).subscribe(tuple => {
            console.log(tuple.getData());
            expect(tuple.getData()).to.be.eqls({err: null, stdout: 'application/json\n', stderr: '', code: 0});
            done();
        })
    });


    it('should reject when failed', (done) => {
        let bashNode = new BashNode('bash_test');
        const conf = {
            pwd: __dirname,
            command: 'oops.sh',
            arguments: ['{{stringify(options)/}}'],
            environments: []
        };

        const {error, value} = bashNode.validate(Joi).validate(conf);
        if (error) {
            console.error(error);
            expect.fail('Failed to validate Bash node configuration')
        }

        bashNode.prepare(value, null).pipe(
            a => bashNode.execute(new Tuple().setId('1').setHeaders({'content-type': 'application/json'}).setData({hello: {world: 1}}))
        ).subscribe(
            tuple => {
                expect.fail("Should not resolve execution");
                done();
            },
            tuple => {
                expect(tuple.getError().message).to.be.equal('Command returns an error status code.');
                done();
            }
        )
    });
});