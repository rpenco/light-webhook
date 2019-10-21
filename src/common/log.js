module.exports.Log =  {
    debug: log,
    warn: log,
    info: log,
    error: log,
};

function debug(){
    // console.log(`${(new Date()).toISOString()} [server] listening on http://${config.hostname || '0.0.0.0'}:${config.port || 8080}`);
}

function log(...args) {
    if(typeof(console) !== 'undefined') {
        console.log((new Date()).toISOString(), ...args);
    }
}