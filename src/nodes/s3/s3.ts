import {SubProcessBuilder} from "../../webhook/lib/SubProcessBuilder";
import Joi from "@hapi/joi";
import {Log} from "../../webhook/lib/log";
import {fromPromise} from "rxjs/internal/observable/fromPromise";
import {bindCallback, bindNodeCallback, Observable, of} from "rxjs";
import {ITuple} from "../../webhook/tuple/tuple";
import {INode, INodeContext} from "../../webhook/node/node";
import {Templatizer} from "../../webhook/lib/templatizer";
import * as Minio from "minio";

interface Settings {
    /**
     * endPoint is a host name or an IP address.
     */
    endPoint: string;

    /**
     * TCP/IP port number. This input is optional. Default value set to 80 for HTTP and 443 for HTTPs.
     */
    port: number;

    /**
     * If set to true, https is used instead of http.
     * @efault false
     */
    useSSL: boolean;

    /**
     * accessKey is like user-id that uniquely identifies your account.
     */
    accessKey: string;

    /**
     * secretKey is the password to your account.
     */
    secretKey: string;

    /**
     * Set this value to provide x-amz-security-token (AWS S3 specific). (Optional)
     */
    sessionToken: string;

    /**
     * Set this value to override default part size of 64MB for multipart uploads. (Optional)
     */
    partSize: number;

    /**
     * Name of the bucket.
     */
    bucketName: string;

    /**
     * Region where the bucket is created. This parameter is optional.
     * @default 'us-east-1'
     */
    region: string;

    /**
     * Name of the object.
     * @default '{{file.filename}}'
     */
    objectName: string;

    /**
     * Headers use to upload file
     */
    headers: { [key: string]: string };
}

/**
 * Execute a Bash/Shell command.
 * Command can be anything.
 * This node is not an InputNode. As any not InputNode it has only responsibility to receive a Tuple from previous node,
 * perform his bash command and forward a Tuple. Forwarded Tuple can be modified/transformed if need.
 */
export class BashNode implements INode {
    protected readonly name: string;
    private conf: Settings;
    private minioClient: any;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.schema {
        return Joi.object({
            endPoint: Joi.string().required(),
            port: Joi.number().required(),
            useSSL: Joi.boolean().default(false),
            accessKey: Joi.string().required(),
            secretKey: Joi.string().required(),
            sessionToken: Joi.string(),
            partSize: Joi.number(),
            bucketName: Joi.string().required(),
            region: Joi.string().default('us-east-1'),
            objectName: Joi.string().default('{{file.filename}}'),
            headers: Joi.object().default({
                'Content-Type': 'application/octet-stream'
            }),
        }).default();
    }

    /**
     * Called when pipeline starts (when application start).
     * @param conf
     * @param context
     */
    prepare(conf: Settings, context: INodeContext): Observable<ITuple<any>> {
        this.conf = conf;
        const options = {
            endPoint: this.conf.endPoint,
            port: this.conf.port,
            useSSL: this.conf.useSSL,
            accessKey: this.conf.accessKey,
            secretKey: this.conf.secretKey,
            sessionToken: this.conf.sessionToken,
            partSize: this.conf.partSize
        };
        this.minioClient = new Minio.Client(options);
        Log.debug(`prepare ${this.name} node. Prepare minio client..`);
        return of();
    }

    /**
     * Called each time a new request arrived.
     * Execute bash command then pass output to a new tuple to next node.
     * @param tuple in this case is previous node
     */
    execute(tuple: ITuple<any>): Observable<ITuple<any>> {
        Log.info(`${this.name} receive tuple id="${tuple.getId()}"`);

        const bucketName = Templatizer.compile(this.conf.bucketName, tuple);
        const region = Templatizer.compile(this.conf.region, tuple);


        return fromPromise(
            this.minioClient.bucketExists(bucketName).then((exists) => {
                Log.info(`${this.name} - Bucket exists="${exists}"`);
                if (exists === false) {
                    return this.minioClient.makeBucket(bucketName, region).then(
                        () => {
                            Log.info(`Bucket created successfully in "${region}".`);
                        });
                }
                return Promise.resolve();
            })
                .catch((error) => {
                    Log.error(`${this.name} - S3 error="${error.message}". Check your configuration.`);
                    Log.debug(error);
                    tuple.setError(error);
                    return tuple;
                })
                .then(
                    () => {
                        const promises = [];
                        for (const key of Object.keys(tuple.getFiles())) {
                            tuple.setCurrentFile(tuple.getFiles()[key]);
                            const objectName = Templatizer.compile(this.conf.objectName, tuple);
                            const metaData = {};
                            for (const key of Object.keys(this.conf.headers)) {
                                metaData[Templatizer.compile(key, tuple)] = Templatizer.compile(this.conf.headers[key], tuple);
                            }

                            promises.push(
                                this.minioClient.fPutObject(bucketName, objectName, tuple.getCurrentFile().path, metaData)
                                    .then(
                                        (etag) => {
                                            Log.info(`${this.name} - File ${tuple.getCurrentFile().path} uploaded successfully. bucketName="${bucketName}" objectName="${objectName}" etag="${etag}"`);
                                            return {file: tuple.getCurrentFile(), objectName, etag, region, bucketName};
                                        })
                                    .catch(
                                        (err) => {
                                            Log.error(`${this.name} - File to upload file ${tuple.getCurrentFile().path}. err="${err.message}" bucketName="${bucketName}" objectName="${objectName}"`);
                                            Log.debug(err);
                                            return Promise.reject(err);
                                        })
                            );

                        }

                        return Promise.all(promises).then((etags: string[]) => {
                            Log.info(`${this.name} - All files uploaded.`);
                            tuple.setData(etags);
                            return tuple;
                        }).catch(err => {
                            tuple.setError(err);
                            return tuple;
                        })
                    },
                    err => {
                        if (err) {
                            Log.error(`${this.name} - Failed to make bucket error="${err.message}" bucketName="${bucketName}" region="${region}"`);
                            Log.debug(err);
                            tuple.setError(err);
                            return Promise.reject(tuple);
                        }
                    }
                )
        );
    }

    /**
     * Called when pipeline stops (when application shutdown)
     * TODO for moment close() is only called on InputNode
     */
    close<T>(): Observable<void> {
        // TODO interrupt running requests
        return of();
    }

    /**
     * Called when a node in the PIPELINE failed.
     * TODO for moment reject() is only called on InputNode
     */
    reject<A, B>(lastStream: ITuple<A>): Observable<ITuple<B>> {
        return of();
    }

    /**
     * Called when a node in the PIPELINE succeed.
     * TODO for moment resolve() is only called on InputNode
     */
    resolve<A, B>(lastStream: ITuple<A>): Observable<ITuple<B>> {
        return of();
    }
}
