var connect = require('connect')
  , http = require('http')
  , fs = require('fs');



var cacheAge = 0;
if (process.env.NODE_ENV === 'production') {
  cacheAge = 60 * 60 * 1000;
}

var app = connect()
  .use(connect.favicon())
  .use(connect.static('public', { maxAge: cacheAge }))
  .use(function(req, res) {
    var index = fs.readFileSync('views/index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
  });

var port = process.env.PORT || 3000;
http.createServer(app).listen(port);
console.log("Listening on port", port)