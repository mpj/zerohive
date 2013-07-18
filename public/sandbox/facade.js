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

    self.isFunction = ko.observable(null);
    self.errorMessage = ko.observable(null);
    self.errorLine = ko.observable(null);
    self.errorColumn = ko.observable(null);
    self.functionArguments = ko.observable([]);

    self.result = ko.observable(null);

    self.analyze = function(source) {
      if (typeof source !== 'string')
        throw new Error('analyze expected source to be of type string, but was ' + source);
      work({ type: 'analyze', source: source }, function(data) {
        processError(data.error);
        self.isFunction(data.isFunction);
        if (!!data['arguments'] && !_.isEqual(self.functionArguments(), data['arguments'])) {
          self.functionArguments(data['arguments']);
        }
      });
    };

    self.execute = function(source, args) {

      work({ type: 'execute', source: source, args: args }, function(data) {
        processError(data.error);
        self.result(data.result);
      });
    };

    var work = function(message, callback) {
      spawnWorker(function(worker) {
        var onData = function(e) {
          worker.removeEventListener('message', onData);
          worker.terminate();
          callback(e.data);
        };
        worker.addEventListener('message', onData, false);
        worker.postMessage(message);
      });
    };

    function processError(error) {
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