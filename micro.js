var connect = require('connect')
  , http = require('http')
  , fs = require('fs')
  , mongodb = require('mongodb')
  , ObjectID = mongodb.ObjectID
  , _ = require('underscore')

var cacheAge = 0;
if (process.env.NODE_ENV === 'production') {
  cacheAge = 60 * 60 * 1000;
}

var app = connect()
  .use(connect.favicon())
  .use(connect.compress()) // must be before static
  .use(connect.static('public', { maxAge: cacheAge }))
  .use(function(req, res) {
    if (req.url === '/') {
      
      playgroundInsert({ 
        versions: [{ 
          body: 'DEFAULT_CODE',
          cases: [{
            conditions: 'CONDITIONS_DEFAULT',
            expectation: 'DEFAULT_EXPECTATION'
          }]
        }]
      }, function(playground) {
        res.writeHead(302, {
          'Location': '/' + playground._id + '/1'
        });
        res.end();
      })

    } else {
      // Not root, assuming /{id}*
      if (req.method === 'GET') {

        if (req.url.indexOf('.json') !== -1) {
          // Assuming /{id}/{version}.json
          // 
          
          // Use this fine regexp to match -> (\w+)\/(\w+)\.?
          var m = req.url.match(/\/?(\w+)\/(\w+)\.?/);

          var id = new ObjectID(m[1]);
          var versionNumber = parseInt(m[2], 10);

          getDatabase(function(db) {
            db.collection('playgrounds').findOne(id, function(err, obj) { 
              console.log("obj", obj, version, m[2])
              var version = obj.versions[versionNumber - 1];
              
              res.writeHead(200, { 'Content-Type': 'text/json' });
              res.end(JSON.stringify(version));  

            })
          })
        } else {
          // HTML is implied
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fs.readFileSync('views/index.html'));      
        }

        
      } else if (req.method === 'POST') {
        playgroundPost(req, res)
      }
    }
    
  });

function getDatabase(callback) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect("mongodb://localhost:27017", function(err, db) {
    if (err) return console.warn('Failed to connect to database.');
    callback(db);
  });
}

function playgroundInsert(playground, success) {
  getDatabase(function(db) {
    var c = db.collection('playgrounds');
    c.insert(playground, { safe: true }, function(err, result) {
      if (err) return console.warn('Failed to insert playground.');
      success(result[0]);
      db.close();
    });
  });
}

// Callback will not be called with any parameters,
// and only on success.
function playgroundUpdate(opts) {
  var id          = opts.id
  var update      = opts.update
  var success     = opts.success

  getDatabase(function(db) {
    var c = db.collection('playgrounds');
    c.update(id, update, { safe: true }, function(err, itemsUpdated) {
      if (err) return console.warn('Failed to update playground.');
      success();
      db.close();
    });
  });
}

// Saves a new version to the given playground. Yields either 
// error or an integer representing the new version number
function saveNewVersion(id, groundVersionState, callback) {
  var mid = new ObjectID(id)
  getDatabase(function(db) {
    var c = db.collection('playgrounds');
    c.update({ _id: mid }, {
      '$push': { 'versions': groundVersionState }
    }, {
      safe: true
    }, function(err, result) {
        console.log("pushjed!", err, result, mid, groundVersionState)
      if (err) 
        return callback(err, null)
      
      c.findOne({'_id': mid }, function(err, item) {
        var newVersionNumber = item.versions.length
        callback(null, newVersionNumber);
      })
    })
  })
}

function playgroundPost(req,res) {

  // assuming '/{id}'
  var id = req.url.replace('/', '');

  // Read Body when Available
  req.on("readable", function(){
    req.body = req.read();
  });

  // Do something with it
  req.on("end", function(){
    var body = JSON.parse(req.body.toString());
    var ground = body.ground;
    
    var cleaned = {};

    var badRequest = function(message) {
      res.writeHead(400);
      res.end(message);
    }

    if (!_.isString(ground.body))
      return badRequest('Property body must be a string')
    cleaned.body = ground.body;

    if(ground.cases) {
      cleaned.cases = [];
      ground.cases.forEach(function(c) {

        if (!_.isString(c.conditions))
          return badRequest('Property conditions must be a string')

        if (!_.isString(c.expectation))
          return badRequest('Property verify must be a string')

        cleaned.cases.push({
          conditions: c.conditions,
          expectation: c.expectation
        });

      })
    }

    saveNewVersion(id, cleaned, function(error, newVersionNumber) {
      if (error) console.warn("saveNewVersion error", error);
      var CREATED = 201
      var location = '/' + id + '/' + newVersionNumber
      res.writeHead(CREATED, { 'Location': location })
      res.end()
    })

  })
  
}

var port = process.env.PORT || 3000;
http.createServer(app).listen(port);
console.log("Listening on port", port)