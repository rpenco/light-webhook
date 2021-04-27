import Joi from "joi";
import {fromPromise} from "rxjs/internal/observable/fromPromise";
import {Observable, of, Subscriber} from "rxjs";
import * as Minio from "minio";
import {AnyRecord, INodeContext, SinkNode} from "../../api";
import {Templatizer} from "../../lib";

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
 * This node is not an InputNode. As any not InputNode it has only responsibility to receive a Record from previous node,
 * perform his bash command and forward a Record. Forwarded Record can be modified/transformed if need.
 */
export class S3Sink extends SinkNode<Settings> {

    // TODO WORK IN PROGRESS. SINK NOT WORK. ANY CONTRIBUTION IS WELCOME

    private minioClient: any;

    /**
     * Validate settings
     * @param Joi
     */
    public validate(Joi): Joi.Schema {
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
    prepare(context: INodeContext): Observable<boolean> {

        const options = {
            endPoint: this.settings().endPoint,
            port: this.settings().port,
            useSSL: this.settings().useSSL,
            accessKey: this.settings().accessKey,
            secretKey: this.settings().secretKey,
            sessionToken: this.settings().sessionToken,
            partSize: this.settings().partSize
        };
        this.minioClient = new Minio.Client(options);
        this.getLogger().debug(`prepare ${this.name} node. Prepare minio client..`);
        return of(true);
    }

    /**
     * Called each time a new request arrived.
     * Execute bash command then pass output to a new record to next node.
     * @param subscriber
     * @param record in this case is previous node
     */
    execute(record: AnyRecord): Observable<AnyRecord> {
        this.getLogger().info(`${this.name} receive record id="${record.id()}"`);

        const bucketName = Templatizer.compile(this.settings().bucketName, record);
        const region = Templatizer.compile(this.settings().region, record);


        return fromPromise(
            this.minioClient.bucketExists(bucketName).then((exists) => {
                this.getLogger().info(`${this.name} - Bucket exists="${exists}"`);
                if (exists === false) {
                    return this.minioClient.makeBucket(bucketName, region).then(
                        () => {
                            this.getLogger().info(`Bucket created successfully in "${region}".`);
                        });
                }
                return Promise.resolve();
            })
                .catch((error) => {
                    this.getLogger().error(`${this.name} - S3 error="${error.message}". Check your configuration.`);
                    this.getLogger().debug(error);
                    // record.setError(error);
                    return record;
                })
                .then(
                    () => {
                        const promises = [];
                        // for (const key of Object.keys(record.getFiles())) {
                        //     record.setCurrentFile(record.getFiles()[key]);
                        //     const objectName = Templatizer.compile(this.settings().objectName, record);
                        //     const metaData = {};
                        //     for (const key of Object.keys(this.settings().headers)) {
                        //         metaData[Templatizer.compile(key, record)] = Templatizer.compile(this.settings().headers[key], record);
                        //     }
                        //
                        //     promises.push(
                        //         this.minioClient.fPutObject(bucketName, objectName, record.getCurrentFile().path, metaData)
                        //             .then(
                        //                 (etag) => {
                        //                     this.getLogger().info(`${this.name} - File ${record.getCurrentFile().path} uploaded successfully. bucketName="${bucketName}" objectName="${objectName}" etag="${etag}"`);
                        //                     return {file: record.getCurrentFile(), objectName, etag, region, bucketName};
                        //                 })
                        //             .catch(
                        //                 (err) => {
                        //                     this.getLogger().error(`${this.name} - File to upload file ${record.getCurrentFile().path}. err="${err.message}" bucketName="${bucketName}" objectName="${objectName}"`);
                        //                     this.getLogger().debug(err);
                        //                     return Promise.reject(err);
                        //                 })
                        //     );
                        //
                        // }

                        return Promise.all(promises).then((etags: string[]) => {
                            this.getLogger().info(`${this.name} - All files uploaded.`);
                            record.setData(etags);
                            return record;
                        }).catch(err => {
                            // record.setError(err);
                            return record;
                        })
                    },
                    err => {
                        if (err) {
                            this.getLogger().error(`${this.name} - Failed to make bucket error="${err.message}" bucketName="${bucketName}" region="${region}"`);
                            this.getLogger().debug(err);
                            // record.setError(err);
                            return Promise.reject(record);
                        }
                    }
                )
        );
    }
}
