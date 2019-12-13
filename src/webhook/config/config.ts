import YAML from "yaml";
import * as fs from "fs";
import {Configuration} from "./configuration";
import HJSON from "hjson";
import Joi from "@hapi/joi";
import {Log} from "../lib/log";

/**
 * Parse configuration file. Validate and returns Configuration object.
 */
export class Config {

    /**
     * Validate configuration file.
     * @param config
     */
    public static validate(config: any): Configuration {
        const schema = Joi.object({
            port: Joi.number().default(8080),
            hostname: Joi.string().default('127.0.0.1'),
            uploadMaxSize: Joi.number().default(0),
            tls: Joi.object({
                enable: Joi.boolean().default(false),
                allowUnsigned: Joi.boolean().default(false),
                key: Joi.string(),
                cert: Joi.string(),
                passphrase: Joi.string(),
            }).default(),
            logger: Joi.object({
                level: Joi.string().default('info'),
                meta: Joi.object().default({}),
                files: Joi.array().default([]),
            }).default(),
            pipelines: Joi.array()
                .items(Joi.object({
                    name: Joi.string(),
                    nodes: Joi.array().items(Joi.object({
                        name: Joi.string(),
                        type: Joi.string(),
                        settings: Joi.object().default({}),
                    })).default([])
                })).required()
        }).default();

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

    /**
     * Read from JSON/HJSON file
     * @param file
     */
    private static fromHjson(file) {
        try {
            return HJSON.parse(file);
        } catch (e) {
            Log.debug('Not an Hjson/Json file.', e.message);
        }
        return false;
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

        let config = Config.fromHjson(file) || Config.fromYaml(file);

        if (config === false) {
            throw new Error(`Failed to read configuration '${confPath}'. Allowed JSON/HJSON or YAML formats.`);
        } else {
            Log.debug('Configuration loaded');
        }

        return Config.validate(config);
    }
}