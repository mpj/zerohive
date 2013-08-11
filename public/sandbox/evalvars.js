importScripts('/vendor/underscore-1.5.1.js');
importScripts('/sandbox/expose-to-parent.js');

// Evaluates a piece of source code (source)
// and returns the values of certain variables (variables) 
// that it assigned. It is irrelevant if the source code
// makes use of the var keyword or not.
// 
// Ex:
// evalVars('cat=5;var dog=3', ['cat', 'dog'])
// > 5, 3
function evalVars(source, variableNames) {
  if (!_.isString(source))
    throw new Error('Expected source to be a string, but was ' + source)
  if(!_.isArray(variableNames))
    throw new Error('Expected source to be an array, but was ' + variableNames)

  eval(source)

  return variableNames.map(function(name) {
    return eval(name)
  })
};

exposeToParent(evalVars)