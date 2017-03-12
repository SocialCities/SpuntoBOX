module.exports = function(app, config) {
    var allowCrossDomain = function(req, res, next) {
        var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'Authorization', 'content-type', 'headers', 'method'];
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));

        if ('OPTIONS' == req.method) {
          res.sendStatus(200);
        }
        else {
          next();
        }
    }

    app.use(allowCrossDomain);
}