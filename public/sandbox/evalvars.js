importScripts('/sandbox/expose-to-parent.js');

// Evaluates _source_ with _variableNames_ as scoped 
// variables, and then returns the values assigned to
// those variables as an array.
function evalVars(source, variableNames) {

  // Scope variable names
  var i;
  for (i = 0; i < variableNames.length; i++) {
    eval('var ' + variableNames[i]);
  }

  eval(source);

  // Evaluate the variables to get their values
  var values = [];
  for (i = 0; i < variableNames.length; i++) {
    values.push(eval(variableNames[i]));
  }

  return values;
};

exposeToParent(evalVars);