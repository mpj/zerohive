if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.caseViewModel = function(argumentNames) {
    var self = {};

    argumentNames = argumentNames || [];

    self.functionArguments = argumentNames.map(function(a) {
      return {
        name: a,
        value: ko.observable(undefined)
      };
    });

    return self;
  };

})();