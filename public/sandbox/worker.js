var isFunction = function(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

// Returns the parameter names of a function as an array of strings
function getParameterNames(fn) {
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var src = fn.toString();
  src = src.replace(STRIP_COMMENTS, '');
  return src.slice(src.indexOf('(')+1, src.indexOf(')')).match(/([^\s,]+)/g);
}

var isolatedEvalVars = (function(src, variableNames) {
  
// Hide worker interface and other stuff from evaled code
  var self;
  var importScripts;
  var XMLHttpRequest;

  // scope variable names
  var i;
  for (i=0;i<variableNames.length;i++) {
    eval('var ' + variableNames[i]);
  }

  eval(src);

  var values = [];
  for (i=0;i<variableNames.length;i++) {
    values.push(eval(variableNames[i]));
  }

  return values;
}).bind({ dummy_object: true });

var isolatedEval = (function(src) {

  // Hide worker interface and other stuff from evaled code
  var self;
  var importScripts;
  var XMLHttpRequest;

  return eval(src);
}.bind({ dummy_object: true }));

function evaluateAsFunction(source) {
  return isolatedEval('[' + source +' ]')[0];
}

function toSimpleError(error) {
  var simpleError = { message: error.message };
  var match = error.stack.toString().match(/<anonymous>:(\d+):(\d+)/);
  if (match) {
    simpleError.line = Number(match[1]);
    simpleError.column = Number(match[2]);
  }
  return simpleError;
}

function run(source, setupSource) {
  var result;
  try {
    var fn = evaluateAsFunction(source);
    result = fn.apply(null, isolatedEvalVars(setupSource, getParameterNames(fn)));
  } catch (error) {
    return self.postMessage({
      error: toSimpleError(error),
      result: null
    });
  }
  return self.postMessage({
    result: result
  });
}

function analyze(source) {
  var fn;
  try {
    fn = evaluateAsFunction(source);
  } catch (error) {
    return self.postMessage({ error: toSimpleError(error) });
  }

  if (!isFunction(fn))
    return self.postMessage({ isFunction: false });

  self.postMessage({
    isFunction: true,
    error: null,
    'arguments': getParameterNames(fn)
  });
}


self.addEventListener('message', function (event) {

  var message = event.data;
  if (message.type === 'analyze') {
    analyze(message.source);
  }

  if (message.type === 'execute') {
    run(message.source, message.setupSource);
  }

}, false);

// Tell parent window that we are ready
self.postMessage({ type: 'ready'});
