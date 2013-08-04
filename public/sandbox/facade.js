if (typeof(Sandbox) === 'undefined') Sandbox = {};


(function() {

  function loadAsString(url, callback) {
    var client = new XMLHttpRequest();
    client.open('GET', url);
    client.onreadystatechange = function() {
      callback(client.responseText);
    };
    client.send();
  }

  var workerSourceCache = null;
  function spawnWorker(callback) {
    if (workerSourceCache === null) {
      loadAsString('/sandbox/worker.js', function(str) {
        workerSourceCache = str;
        spawnWorker(callback);
      });
      return;
    }
    var blob = new Blob([workerSourceCache],{ type: 'text/javascript'});
    var objectUrl = URL.createObjectURL(blob);
    var worker = new Worker(objectUrl);
    var onReady = function(e) {
      if (e.data.type !== 'ready')
        throw new Error('Expected first message to be ready event');
      worker.removeEventListener("message", onReady);
      callback(worker);
    };
    worker.addEventListener("message", onReady, false);

    var wrappedTerminate = worker.terminate.bind(worker);
    worker.terminate = function() {
      URL.revokeObjectURL(worker.__objectUrl);
      wrappedTerminate();
    };
  }

  Sandbox.facade = function() {

    var self = {};

    var _worker = null;

    self.isFunction = ko.observable(null);
    self.errorMessage = ko.observable(null);
    self.errorLine = ko.observable(null);
    self.errorColumn = ko.observable(null);
    self.functionArguments = ko.observable([]);

    self.result = ko.observable(null);    

    self.analyze = function(source) {
      if (typeof source !== 'string')
        throw new Error('analyze expected source to be of type string, but was ' + source);
      try {
        var syntax = esprima.parse(source);
      } catch (error) { return processAnyError(error); }
      processAnyError(null);
      self.isFunction(
        syntax.body.length === 1 && 
        syntax.body[0].type === "FunctionDeclaration"
      )
      if (self.isFunction()) {
        var declaration = syntax.body[0];
        var argumentNames = declaration.params.map(function(p) {
          return p.name;
        });
        if (!_.isEqual(self.functionArguments(), argumentNames))
          self.functionArguments(argumentNames);
      }
    };

    self.execute = function(source, setupSource) {
      work({ type: 'execute', source: source, setupSource: setupSource }, function(data) {
        processAnyError(data.error);
        self.result(data.result);
      });
    };



    var work = function(message, callback) {
      if (!_worker) {
        return spawnWorker(function(w) {
          _worker = w;
          work(message, callback);
        });
      }

      var onData = function(e) {  
        callback(e.data);
      };
      _worker.addEventListener('message', onData, false);
      _worker.postMessage(message);
    };

    function processAnyError(error) {
      if (!!error) {
        self.errorMessage(error.message);
        self.errorLine(error.line || null);
        self.errorColumn(error.column || null);
      } else {
        self.errorMessage(null);
        self.errorLine(null);
        self.errorColumn(null);
      }
    }

    return self;
  };

})();