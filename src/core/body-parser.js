module.exports = function BodyParser(req, res, next) {
    if (['post', 'put'].indexOf(req.method.toLowerCase()) > -1) {
        let body = "";
        req.on('readable', function () {
            body += req.read();
        });
        req.on('end', function () {
            if (req.headers['content-type'] === 'application/json') {
                try {
                    req.body = JSON.parse(body.substr(0, body.length - 'null'.length));
                    next()
                } catch (e) {
                    console.error('[BodyParser] failed to parse JSON', e);
                    req.body = {};
                    next()
                }
            } else if(req.headers['content-type'] === 'application/json'){
                req.body = {};
                next()
            } else {
                req.body = {};
                next()
            }
        });
    } else {
        next()
    }
};
