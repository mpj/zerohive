importScripts('/vendor/underscore-1.5.1.js');

// Returns the parameter names of a function as an array of strings
function getParameterNames(fn) {
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var src = fn.toString();
  src = src.replace(STRIP_COMMENTS, '');
  return src.slice(src.indexOf('(')+1, src.indexOf(')')).match(/([^\s,]+)/g);
}

function evaluateAsFunction(source) {
  return eval('[' + source +' ]')[0];
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

function run(source, args) {
  var result;
  try {
    args = args.map(function(a) { return eval(a); });
    result = evaluateAsFunction(source).apply(null, args);
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

  if (!_.isFunction(fn))
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
    run(message.source, message.args);
  }

}, false);

// Tell parent window that we are ready
self.postMessage({ type: 'ready'});
