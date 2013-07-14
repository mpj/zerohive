if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.sandboxViewModel = function(opts) {
    var self = {};

    var _nextReceiveHandler = null;
    var _sendRequestHandler = null;
    var _sendRequestQueue = [];

    var error = ko.observable(null);

    self.authority = opts.authority;
    self.path = opts.path;

    self.isFunction = ko.observable(null);
    self.errorMessage = ko.observable(null);
    self.functionArguments = ko.observable([]);

    self.onSendRequest = function(fn) {
      _sendRequestHandler = fn;
      runQueue();
    };

    self.receive = function(data) {
      _nextReceiveHandler(data);
      _nextReceiveHandler = null;
    };

    self.analyze = function(source) {
      _sendRequestQueue.push(
        { messageData: { type: 'analyze', source: source },
        callback: function(data) {
          self.errorMessage(!!data.error ? data.error.message : null);
          self.functionArguments(data['arguments']);
          self.isFunction(data.isFunction);
        } });
      runQueue();
    };

    function runQueue() {

      if (!_sendRequestHandler) return;
      var queueItem = _sendRequestQueue.pop();
      if (queueItem) {
        _nextReceiveHandler = function(data) {
          queueItem.callback(data);
          runQueue();
        };
        _sendRequestHandler(queueItem.messageData);
      }
    }


    return self;
  };

})();