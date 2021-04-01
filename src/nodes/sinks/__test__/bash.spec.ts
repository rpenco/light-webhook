describe('Bash', () => {

    // it('should print stringified record object', (done) => {
    //     let bashNode = new BashSink(null, Log);
    //     const conf = {
    //         pwd: __dirname,
    //         command: 'echo',
    //         arguments: ['{{stringify(options)/}}'],
    //         environments: []
    //     };
    //
    //     const {error, value} = bashNode.validate(Joi).validate(conf);
    //     if (error) {
    //         console.error(error);
    //         expect.fail('Failed to validate Bash node configuration')
    //     }
    //
    //     let subscriber:any = null;
    //     bashNode.prepare(null).pipe(
    //         () => {
    //             bashNode.execute(subscriber, new AnyRecord({hello: {world: 1}}));
    //             return subscriber;
    //         }
    //     ).subscribe(record => {
    //         expect(record.getData()).to.be.eqls({
    //             err: null,
    //             stdout: '{headers:{},context:{},files:{},id:1,data:{hello:{world:1}}}\n',
    //             stderr: '',
    //             code: 0
    //         });
    //         done();
    //     })
    // });
    //
    // it('should print specific record value', (done) => {
    //     let bashNode = new BashSink(null, Log);
    //     const conf = {
    //         pwd: __dirname,
    //         command: 'echo',
    //         arguments: ['{{ headers["content-type"] }}'],
    //         environments: []
    //     };
    //
    //     const {error, value} = bashNode.validate(Joi).validate(conf);
    //     if (error) {
    //         console.error(error);
    //         expect.fail('Failed to validate Bash node configuration')
    //     }
    //
    //     bashNode.prepare(value, null).pipe(
    //         a => bashNode.execute(new Record().setId('1').setHeaders({'content-type': 'application/json'}).setData({hello: {world: 1}}))
    //     ).subscribe(record => {
    //         console.log(record.getData());
    //         expect(record.getData()).to.be.eqls({err: null, stdout: 'application/json\n', stderr: '', code: 0});
    //         done();
    //     })
    // });
    //
    //
    // it('should reject when failed', (done) => {
    //     let bashNode = new BashSink('bash_test');
    //     const conf = {
    //         pwd: __dirname,
    //         command: 'oops.sh',
    //         arguments: ['{{stringify(options)/}}'],
    //         environments: []
    //     };
    //
    //     const {error, value} = bashNode.validate(Joi).validate(conf);
    //     if (error) {
    //         console.error(error);
    //         expect.fail('Failed to validate Bash node configuration')
    //     }
    //
    //     bashNode.prepare(value, null).pipe(
    //         a => bashNode.execute(new Record().setId('1').setHeaders({'content-type': 'application/json'}).setData({hello: {world: 1}}))
    //     ).subscribe(
    //         record => {
    //             expect.fail("Should not resolve execution");
    //             done();
    //         },
    //         record => {
    //             expect(record.getError().message).to.be.equal('Command returns an error status code.');
    //             done();
    //         }
    //     )
    // });
});