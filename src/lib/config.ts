import YAML from "yaml";
import * as fs from "fs";
import Joi from "joi";
import {Log} from "./log";
import {Configuration} from "../api";

/**
 * Parse configuration file. Validate and returns Configuration object.
 */
export class Config {

    /**
     * Validate configuration file.
     * @param config
     */
    public static getConf(config: any): Configuration {
        const schema = Joi.object({
            name: Joi.string().default('default'),
            interval: Joi.number().default(1000),
            logger: Joi.object({
                level: Joi.string().default('info'),
                meta: Joi.object().default({}),
                files: Joi.array().default([]),
            }).default(),
            stream: Joi.array()
                .items(Joi.object({
                    name: Joi.string(),
                    type: Joi.string(),
                    settings: Joi.object().default({}),
                    out: Joi.array().default([]),
                })).default([])
        }).default();
        
        return this.validate(schema, config);
    }

    /**
     * Read from Yaml file
     * @param file
     */
    private static fromYaml(file) {
        try {
            return YAML.parse(file)
        } catch (e) {
            Log.debug('Not an Yaml file.', e.name, e.message);
        }
        return false;
    }


    public static validate(schema: any, config: any) {
        const {error, value} = schema.validate(config);
        if (error && error.details.length > 0) {
            let errorMessages = ["Invalid in configuration:"];
            for (let err of error.details) {
                errorMessages.push(err.message);
                Log.debug(err.message)
            }
            throw new Error(errorMessages.join('\n'))
        }
        return value;
    }

    public read(confPath: string): Configuration {
        Log.debug('read configuration from path=', confPath);
        let file;
        try {
            file = fs.readFileSync(confPath, 'utf8');
        } catch (e) {
            Log.error(e.message);
            throw new Error(`Failed to read configuration '${confPath}'. Please specify an absolute path.`);
        }

        let config = Config.fromYaml(file);

        if (config === false) {
            throw new Error(`failed to read yaml configuration at '${confPath}'.`);
        } else {
            Log.debug('Configuration loaded');
        }

        return Config.getConf(config);
    }
}