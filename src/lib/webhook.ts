import {map} from "rxjs/operators";
import {Observable} from "rxjs";
import {IStreamContext, Stream} from "./stream";
import {Log} from "./log";
import {Configuration} from "../api";

export class Webhook {
    /**
     * Stream instance
     * @private
     */
    stream: Stream;

    /**
     * Stream configuration
     */
    configuration: Configuration;



    /**
     * Configure the application
     * @param configuration
     */
    constructor(configuration: Configuration) {
        this.configuration = configuration;
        this.load()
    }

    public start(): Observable<any> {
        Log.info("starting stream");
        return this.stream
            .prepare()
            .pipe(map(() => {
                return this.stream.start();
            }));
    }


    /**
     * Instantiate stream.
     */
    load() {
        Log.debug("loading context ");

        let context = <IStreamContext>{
            name: this.configuration.name,
            logger: Log,
            nodes: this.configuration.stream
        };
        Log.debug("context loaded")
        this.stream = new Stream(context).build();
    }

    stop(): Observable<boolean> {
        return this.stream.stop().pipe(map((value: boolean) => {
            Log.info("stopped with success");
            return value;
        }));
    }

}
