if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  // TODO: Encapsulate a bit more
  ZeroHive.sandboxViewModel = function(opts) {

    var self = {};

    var worker = new Worker('/viewmodels/evaluator.js');

    worker.addEventListener('message', function(event) {
      // Special message ready sent by iframe when it's loaded
      if (event.data.type === 'ready') {
        self.onSendRequest(function(messageData) {
          worker.postMessage(messageData);
        });
        return;
      }
      self.receive(event.data);
    }, false);

    var _nextReceiveHandler = null;
    var _sendRequestHandler = null;
    var _sendRequestQueue = [];

    var error = ko.observable(null);

    self.authority = opts.authority;
    self.path = opts.path;

    self.isFunction = ko.observable(null);
    self.errorMessage = ko.observable(null);
    self.errorLine = ko.observable(null);
    self.errorColumn = ko.observable(null);
    self.functionArguments = ko.observable([]);

    self.result = ko.observable(null);

    self.onSendRequest = function(fn) {
      _sendRequestHandler = fn;
      runQueue();
    };

    self.receive = function(data) {
      _nextReceiveHandler(data);
    };

    self.analyze = function(source) {
      sendMessage({ type: 'analyze', source: source });
    };

    self.execute = function(source, args) {
      sendMessage({ type: 'execute', source: source, args: args });
    };

    var sendMessage = function(messageData) {
      
      _sendRequestQueue.push(
        { messageData: messageData,
        callback: function(data) {
          if (!!data.error) {
            self.errorMessage(data.error.message);
            self.errorLine(data.error.line || null);
            self.errorColumn(data.error.column || null);
          } else {
            self.errorMessage(null);
            self.errorLine(null);
            self.errorColumn(null);
          }

          if (typeof data.result !== 'undefined') {
            // execution
            self.result(data.result);
          } else if(typeof data['arguments'] !== 'undefined' && typeof data.isFunction !== 'undefined') {
            // analyze
            if (self.functionArguments().join(',') !== data['arguments'].join(',')) {
              self.functionArguments(data['arguments']);
              self.isFunction(data.isFunction);
            }
          }
        } });
      runQueue();
    };

    var running = false;
    function runQueue() {
      if (running) {
        return;
      };
      running = true;
      if (!_sendRequestHandler) {
        running = false;
        return;
      }
      var queueItem = _sendRequestQueue.pop();
      if (queueItem) {
        _nextReceiveHandler = function(data) {
          queueItem.callback(data);
          running = false;
          runQueue();
        };
        _sendRequestHandler(queueItem.messageData);
      } else {
        running = false;
      }
    }


    return self;
  };

})();