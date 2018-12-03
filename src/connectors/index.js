module.exports = {
    receivers: {
        http: require('./receivers/http'),
        gitlab: require('./receivers/gitlab'),
        github: require('./receivers/github'),
    },
    emitters: {
        bash: require('./emitters/bash'),
        http: require('./emitters/http'),
    }
};
