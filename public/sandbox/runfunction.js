importScripts('/vendor/esprima.js');
importScripts('/sandbox/expose-to-parent.js');

function runFunction(source, argumentArray) {
  if (typeof source !== 'string')
    throw new Error('runFunction expected source ' +
        'to be of type string, but was ' + source);
  return parseFunction(source).apply(null, argumentArray);
}

// Takes the string source of a function and returns a function object
function parseFunction(source) {
  var firstBracketIndex = source.indexOf('{');
  var lastBracketIndex = source.lastIndexOf('}');
  var body = source.substring(firstBracketIndex + 1, lastBracketIndex);
  var parameterNames = extractParameterNames(source);
  return applyToConstructor(Function, parameterNames.concat(body));
}

// A function used to call a constructor with an array
// of arguments, like apply does, instead a comma-separated.
function applyToConstructor(constructor, argumentArray) {
  var args = [ null ].concat(argumentArray);
  var factoryFunction = constructor.bind.apply(constructor, args);
  return new factoryFunction();
}

// Returns the parameter names of a function source as an
// array of strings
function extractParameterNames(functionSource) {
  return esprima.parse(functionSource).body[0].params.map(function(p) {
    return p.name;
  });
}

exposeToParent(runFunction);

