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

function run(source, args, callback) {
  var result;
  try {
    args = args.map(function(a) { return eval(a); });
    result = evaluateAsFunction(source).apply(null, args);
  } catch (error) {
    return callback({
      error: toSimpleError(error),
      result: null
    });
  }
  return callback({
    result: result
  });
}

function analyze(source, callback) {
  var fn;
  try {
    fn = evaluateAsFunction(source);
  } catch (error) {
    return callback({ error: toSimpleError(error) });
  }

  if (!_.isFunction(fn))
    return callback({ isFunction: false });

  callback({
    isFunction: true,
    error: null,
    'arguments': getParameterNames(fn)
  });
}

function sendToParentWindow(data) {
  self.postMessage(data);
}

function onMessageFromParentWindow(event) {

  var message = event.data;
  if (message.type === 'analyze' && !!message.source) {
    analyze(message.source, sendToParentWindow);
  }

  if (message.type === 'execute') {
    run(message.source, message.args, sendToParentWindow);
  }
}

self.addEventListener('message', onMessageFromParentWindow, false);

// Tell parent window that we are ready
sendToParentWindow({ type: 'ready'});
