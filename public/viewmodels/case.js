if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.caseViewModel = function(argumentNames) {
    var self = {};

    argumentNames = argumentNames || [];

    var sandbox = Sandbox.facade();

    var lockedResult = ko.observable(null);

    self.locked = ko.observable(false);
    self.locked.subscribe(function(l) {
      if (l) lockedResult(self.result());
      else lockedResult(null);
    });

    self.source = ko.observable(null);

    self.functionArguments = argumentNames.map(function(a) {
      return {
        name: a,
        value: ko.observable(undefined)
      };
    });

    var argumentValues = ko.computed(function() {
      return self.functionArguments.map(function(a) {
        return a.value();
      });
    });

    argumentValues.subscribe(function() { self.locked(false); });

    ko.computed(function() {
      if (self.source() === null) return;
      sandbox.execute(self.source(), argumentValues());
    });

    var pass = ko.computed(function() {
      if (lockedResult() === null) return null;
      return _.isEqual(sandbox.result(), lockedResult());
    });

    self.result = ko.computed(function() {
      if (pass() || pass() === null)
        return sandbox.result();
      return sandbox.result()+ '(Expected ' + lockedResult() + ')';
    });

    self.resultClass = ko.computed(function() {
      if (pass() === null) return '';
      return pass() ? 'pass' : 'fail';
    });

    return self;
  };

})();