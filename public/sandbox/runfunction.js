importScripts('/vendor/esprima.js');
importScripts('/sandbox/expose-to-parent.js');
importScripts('/vendor/underscore-1.5.1.js');

// Takes the string of a function, parses it to an 
// actual function and calls it with the arguments
// in argumentArray.
function runFunction(source, argumentArray) {
  if (!_.isString(source))
    throw new Error('runFunction expected source ' +
        'to be of type string, but was ' + source)

  if (!_.isArray(argumentArray))
    throw new Error('runFunction expected argumentArray ' +
      'to be an array, but was ' + argumentArray)

  return parseFunction(source).apply(null, argumentArray)
}

// Takes the string source of a function and returns a function object
function parseFunction(source) {
  var firstBracketIndex = source.indexOf('{')
  var lastBracketIndex = source.lastIndexOf('}')
  var body = source.substring(firstBracketIndex + 1, lastBracketIndex)
  var parameterNames = extractParameterNames(source)
  return applyToConstructor(Function, parameterNames.concat(body))
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
  
  var syntax = null;
  try { syntax = esprima.parse(functionSource) } 
  catch(e) {}

  if ( syntax === null          ||
       syntax.body.length !== 1 || 
      !syntax.body[0]           || 
       syntax.body[0].type !== 'FunctionDeclaration')
    throw new Error('Could not parse as function: ' +  functionSource)

  return syntax.body[0].params.map(function(p) { return p.name })
  
}

exposeToParent(runFunction);

