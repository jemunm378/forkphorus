var fs = require('fs');
var http = require('http');
var url = require('url');
var querystring = require('querystring');

var MIME_TYPES = {

};

http.createServer(function(req, res) {

  var u = url.parse(req.url);

  if (u.pathname === '/proxy.php') {

    var params = querystring.parse(u.query);
    if (!params.u) {
      res.writeHead(404);
      return res.end();
    }

    var proxyURL = url.parse(params.u);

    var q = http.request(proxyURL, function(r) {
      var cache = r.headers['content-type'] === 'application/json' ? 'max-age=0, no-cache' : 'public, max-age=31536000';
      res.writeHead(r.statusCode, {
        'Content-Type': r.headers['content-type'],
        'Cache-Control': cache
      });
      r.on('data', function (chunk) {
        res.write(chunk);
      });
      r.on('end', function() {
        res.end();
      });
    });
    q.on('error', function(e) {
      res.writeHead(500);
      res.end();
    });
    q.end();

    return;
  }

  if (u.pathname === '/') {
    u.pathname = '/index.html';
  }

  fs.readFile(__dirname + u.pathname, function(err, data) {
    if (err || !data) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200);
    return res.end(data);
  });

}).listen(process.env.PORT || 8080, process.env.HOST);
