var connect = require('connect')
  , http = require('http')
  , fs = require('fs');

 var index = fs.readFileSync('views/index.html');

var app = connect()
  .use(connect.favicon())
  .use(connect.static('public'))
  .use(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
  });

var port = process.env.PORT || 3000;
http.createServer(app).listen(port);
console.log("Listening on port", port)