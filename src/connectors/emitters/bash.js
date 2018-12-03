const exec = require('child_process').exec;
const InlineArgs = require('../../common/inlineArgs');

module.exports = function connector(client, publish) {

    return new Promise(function (resolve, reject) {


        const cmd = publish.settings.cmd.map((arg) => arg).join(' ');
        // TODO replace keyword

        console.log(`[${client.name}][${publish.name}] execute bash command: "${cmd}"`);
        let code = -1;
        const pt = exec(cmd, function (err, stdout, stderr) {
            if (err) {
                console.log(`[${client.name}][${publish.name}] bash command error: ${InlineArgs({
                    err: err,
                    stdout: stdout,
                    stderr: stderr,
                    code: code
                })}`);
                return reject();
            }
            console.log(`[${client.name}][${publish.name}] bash command resolved: ${InlineArgs({
                err: err,
                stdout: stdout,
                stderr: stderr,
                code: code
            })}`);
            resolve();
        });

        pt.on('exit', function (cde) {
            code = cde;
        });
    });
};
