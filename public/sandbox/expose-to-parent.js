function exposeToParent(fn) {

  function toSimpleError(error) {
    var simpleError = { message: error.message };
    var match = error.stack.toString().match(/<anonymous>:(\d+):(\d+)/);
    if (match) {
      simpleError.line = Number(match[1]);
      simpleError.column = Number(match[2]);
    }
    return simpleError;
  }

  var onMessage = function (event) {
    try {
      self.postMessage({
        result: fn.apply(null, event.data)
      })
    } catch (error) {
      self.postMessage({ 
        error: toSimpleError(error)
      })
    }
  }
  self.addEventListener('message', onMessage, false)
  self.postMessage({ ready: true })
  
}

