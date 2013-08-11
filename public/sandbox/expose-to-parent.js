
// Exposes a function (fn) to the parent of a Web Worker.
function exposeToParent(fn) {

  // After running exposeToParent, the worker expects 
  // any message ...
  var onMessage = function (event) {
    try {
      // to be an array that it will use to call
      // fn. Anything returned by fn will be posted back to the 
      // parent of the web worker, as the property "result" of
      // an object literal. 
      self.postMessage({
        result: fn.apply(null, event.data)
      })
    } catch (error) {
      // Any message thrown during execution of fn
      // will be posted back to the parent.
      self.postMessage({ 
        error: toSimpleError(error)
      })
    }
  }
  self.addEventListener('message', onMessage, false)

  // toSimpleError is a helper to convert errors into 
  // objects that are passable as messages to parent worker
  function toSimpleError(error) {
    var simpleError = { message: error.message }
    var match = error.stack.toString().match(/<anonymous>:(\d+):(\d+)/)
    if (match) {
      simpleError.line    = Number(match[1])
      simpleError.column  = Number(match[2])
    }
    return simpleError;
  }

  // As soon as exposeToParent is run, it will post a single
  // message to the parent, with a simple object with a single
  // property "ready" set to true. Thus, exposeToParent is meant
  // to be called as the very last step of initializing a worker.
  self.postMessage({ ready: true })
  
}

