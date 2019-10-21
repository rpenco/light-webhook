/**
 * Define here subscribers and publishers connectors
 */
module.exports = {
    subscribers: {
        http: require('./subscribers/http'),
        gitlab: require('./subscribers/gitlab'),
        github: require('./subscribers/github'),
    },
    publishers: {
        bash: require('./publishers/bash'),
        http: require('./publishers/http'),
        file: require('./publishers/file')
    }
};
