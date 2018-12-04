const exec = require('child_process').exec;
const InlineArgs = require('../../common/inlineArgs');

module.exports = function BashEmitter(client, publish, subscribe, event) {

    return new Promise(function (resolve, reject) {

        const cmd = publish.settings.cmd.map((arg) => arg).join(' ').replace(/{{.*?}}/g, (val)=> {
            const key = val.substr(2, val.length - 4).split('.');

            let t = event;
            key.forEach((k)=> { t = t[k]; });

            return t;
        });
        // TODO replace keyword

        console.log(`[${client.name}][${publish.name}] emitter execute bash command: "${cmd}"`);
        let code = -1;
        const pt = exec(cmd, function (err, stdout, stderr) {
            if (err) {
                console.log(`[${client.name}][${publish.name}] bash command error: ${InlineArgs({
                    err: err,
                    stdout: stdout,
                    stderr: stderr,
                    code: code
                })}`);
                return reject(err);
            }
            console.log(`[${client.name}][${publish.name}] bash command resolved: ${InlineArgs({
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
