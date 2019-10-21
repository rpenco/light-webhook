const exec = require('child_process').exec;
const InlineArgs = require('../../common/inlineArgs');
const Templatizer = require('../../common/templatizer');

module.exports = function BashPublisher(client, publish, subscribe, event) {

    return new Promise(function (resolve, reject) {

        const {stringify, cmd} = publish.settings;

        const execCmd = Templatizer(cmd.map((arg) => arg).join(' '), event, {stringify: stringify});

        console.log(`${(new Date()).toISOString()} [${client.name}][${publish.name}] emitter execute bash command: "${execCmd}"`);
        let code = -1;
        const pt = exec(execCmd, function (err, stdout, stderr) {
            if (err) {
                console.log(`${(new Date()).toISOString()} [${client.name}][${publish.name}] bash command error: ${InlineArgs({
                    err: err,
                    stdout: stdout,
                    stderr: stderr,
                    code: code
                })}`);
                return reject(err);
            }
            console.log(`${(new Date()).toISOString()} [${client.name}][${publish.name}] bash command resolved: ${InlineArgs({
                err: err,
                stdout: stdout,
                stderr: stderr,
                code: code
            })}`);

            resolve({
                err: err,
                stdout: stdout,
                stderr: stderr,
                code: code
            });
        });

        pt.on('exit', function (cde) {
            code = cde;
        });
    });
};
