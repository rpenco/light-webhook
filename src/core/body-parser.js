module.exports = function BodyParser(req, next) {
    if (['post', 'put'].indexOf(req.method.toLowerCase()) > -1) {

        let body = "";
        req.on('readable', function () {
            body += req.read();
        });
        req.on('end', function () {
            try {
                req.body = JSON.parse(body.substr(0, body.length - 'null'.length));
                next()
            } catch (e) {
                console.error('BodyParser error', e);
                req.body = {};
                next()
            }
        });
    } else {
        next()
    }
};
