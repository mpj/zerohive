if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.caseViewModel = function(argumentNames) {
    var self = {};

    argumentNames = argumentNames || [];

    var sandbox = Sandbox.facade();

    self.source = ko.observable(null);

    self.functionArguments = argumentNames.map(function(a) {
      return {
        name: a,
        value: ko.observable(undefined)
      };
    });

    ko.computed(function() {
      if (self.source() === null) return;
      var argumentValues = self.functionArguments.map(function(a) {
        return a.value();
      });
      sandbox.execute(self.source(), argumentValues);
    });

    self.result = sandbox.result;

    return self;
  };

})();