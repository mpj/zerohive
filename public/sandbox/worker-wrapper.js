// Functions created by workerWrapper can be thought of as
// the "clients" to the exposeToParent "server". It accepts 
// the path to a worker that uses exposeToParent to expose a
// function, and returns a function that actually instanciates 
// a worker and calls the function in the worker. 
function workerWrapper(path) {
  return function() {
    
    // Convert the arguments object to a normal array
    var argumentArray = Array.prototype.slice.call(arguments, 0);

    // Assume the last argument to be the callback and 
    // set it aside from the rest of the arguments.
    var callback = argumentArray.pop();
    var worker = new Worker(path)
    
    // Create a message handler ...
    worker.addEventListener('message', function(e) {
      
      if (e.data.ready) {
        // We handle the ready message.
        // This will be the first message we receive, because
        // calling addEventListener on a worker will be the 
        // trigger for loading and executing it. Workers that uses 
        // exposeToParent will, at the end of their initializiation, 
        // send a single  message with a property "ready" set. 
        // workerWrapper will then send the actual function call 
        // to the worker. This is accomplished simply by
        // posting the arguments of our array:
        worker.postMessage(argumentArray);
      
      } else {
        
        // If a message is NOT the ready event, it will be
        // the result of calling the function exposed by 
        // exposeToParent.
        
        // Let's send results to the callback that 
        // we set aside earlier.

        // If it is an error, pass it as the first argument...
        if (e.data.error) callback(e.data.error)

        // and if it's not, as the second...
        else callback(null, e.data.result)

        worker.terminate()
      }

    })
  }
}


