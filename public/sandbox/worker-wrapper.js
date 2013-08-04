if (typeof(Sandbox) === 'undefined') Sandbox = {};

(function() {

  Sandbox.getVariables = workerWrapper('/sandbox/evalvars.js');
  Sandbox.runFunction = workerWrapper('/sandbox/runfunction.js');

  function workerWrapper(path) {
    return function() {
      var argumentArray = Array.prototype.slice.call(arguments, 0);
      var callback = argumentArray.pop();
      var worker = new Worker(path)
      var onMessage = function(e) {
        var message = e.data;
        if (message.ready) {
          worker.postMessage(argumentArray);
        } else {
          if (message.error) callback(message.error)
          else callback(null, message.result)
          worker.terminate()
        }
      }
      worker.addEventListener('message', onMessage, false); 
    }
  }

})();


