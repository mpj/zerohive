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

  eval(source)

  return variableNames.map(function(name) {
    return eval(name)
  })
};

exposeToParent(evalVars)