const YAML = require("yaml");
const path = require('path');
const fs = require('fs');

module.exports.Config = function () {
    return {
        read: readConfiguration
    }
};

function readConfiguration(confPath) {
    const file = fs.readFileSync(confPath, 'utf8');
    const extension = path.extname(confPath);
    if (extension === '.json') {
        return parseJSON(file);
    } else if (extension === '.yaml' || extension === '.yml') {
        return parseYAML(file);
    } else {
        console.error(`${(new Date()).toISOString()} [config] Failed to read configuration '${confPath}'. Invalid extension, found '${extension}' and allow only '.json' and '.yaml'`)
    }
}

function parseYAML(file) {
    return YAML.parse(file)
}

function parseJSON(file) {
    return JSON.parse(file);
}