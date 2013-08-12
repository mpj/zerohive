function createSandbox() {
  
  var self = {};

  var getVariables = workerWrapper('/sandbox/evalvars.js');
  var runFunction = workerWrapper('/sandbox/runfunction.js');

  self.isFunction = ko.observable(null);
  self.errorMessage = ko.observable(null);
  self.errorLine = ko.observable(null);
  self.errorColumn = ko.observable(null);
  self.functionArguments = ko.observable([]);

  self.result = ko.observable(null);    

  self.analyze = function(source) {
    if (typeof source !== 'string')
      throw new Error('analyze expected source to be of type string, but was ' + source);
    try {
      var syntax = esprima.parse(source);
    } catch (error) { return processAnyError(error); }
    processAnyError(null);
    self.isFunction(
      syntax.body.length === 1 && 
      syntax.body[0].type === "FunctionDeclaration"
    )
    if (self.isFunction()) {
      var declaration = syntax.body[0];
      var argumentNames = declaration.params.map(function(p) {
        return p.name;
      });
      if (!_.isEqual(self.functionArguments(), argumentNames))
        self.functionArguments(argumentNames);
    }
  };

  self.execute = function(source, setupSource) {
    getVariables(setupSource, self.functionArguments.peek(), function(error, variables) {
      processAnyError(error);
      if (variables)
        runFunction(source, variables, function(error, result) {
          processAnyError(error);
          if (error === null && !_.isEqual(result, self.result())) self.result(result);
        })
    })
  };

  function processAnyError(error) {
    if (!!error) {
      self.errorMessage(error.message);
      self.errorLine(error.line || null);
      self.errorColumn(error.column || null);
    } else {
      self.errorMessage(null);
      self.errorLine(null);
      self.errorColumn(null);
    }
  }

  return self;
};
