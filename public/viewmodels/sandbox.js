if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  // TODO: Encapsulate a bit more
  ZeroHive.sandboxViewModel = function() {

    var self = {};

    self.isFunction = ko.observable(null);
    self.errorMessage = ko.observable(null);
    self.errorLine = ko.observable(null);
    self.errorColumn = ko.observable(null);
    self.functionArguments = ko.observable([]);

    self.result = ko.observable(null);

    self.analyze = function(source) {
      work({ type: 'analyze', source: source }, function(data) {

        self.isFunction(data.isFunction);
        if (!!data['arguments'] && !_.isEqual(self.functionArguments(), data['arguments'])) {
          self.functionArguments(data['arguments']);
        }
      });
    };

    self.execute = function(source, args) {
      work({ type: 'execute', source: source, args: args }, function(data) {
        self.result(data.result);
      });
    };

    var work = function(message, callback) {
      var worker = new Worker('/viewmodels/evaluator.js');
      var onReady = function(e) {
        if (e.data.type !== 'ready')
          throw new Error('Expected first message to be ready event');
        worker.removeEventListener("message", onReady);
        var onData = function(e) {
          worker.removeEventListener('message', onData);
          worker.terminate();
          callback(e.data);
        };
        worker.addEventListener('message', onData, false);
        worker.postMessage(message);
      };
      worker.addEventListener("message", onReady, false);
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