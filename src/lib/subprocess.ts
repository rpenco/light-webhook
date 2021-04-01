const exec = require('child_process').exec;

export class SubProcessResult {
    /**
     * Error message
     */
    err: string;

    /**
     * Out record
     */
    stdout: string;

    /**
     * Error record
     */
    stderr: string;

    /**
     * Result code.
     */
    code: number;
}

export class SubprocessBuilder {
    private currentDir: string;
    private cmd: string;
    private args: string[];
    private envs: string[];

    /**
     * Execute command from directory
     * @param currentDir
     */
    public pwd(currentDir: string): SubprocessBuilder {
        this.currentDir = currentDir;
        return this;
    }

    /**
     * Command name
     * @param cmd name
     */
    public command(cmd: string): SubprocessBuilder {
        this.cmd = cmd;
        return this;
    }

    /**
     * Command arguments
     * @param args argument list
     */
    public arguments(args: string[]): SubprocessBuilder {
        this.args = args;
        return this;
    }

    /**
     * Set environment variables
     * @param environments
     */
    public environments(environments: string[]):SubprocessBuilder {
        this.envs = environments;
        return this;
    }

    public execute(): Promise<any> {
        return new Promise(((resolve, reject) => {
            let code = -1;
            const pt = exec(`${this.cmd} ${this.args.join(' ')}`, function (err, stdout, stderr) {
                if (err) {
                    return reject(err);
                }

                resolve(<SubProcessResult>{
                    err: err,
                    stdout: stdout,
                    stderr: stderr,
                    code: code
                });
            });

            pt.on('exit', function (cde) {
                code = cde;
            });
        }));
    }


}