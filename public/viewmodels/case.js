if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.caseViewModel = function() {
    var self = {};

    var sandbox = Sandbox.facade();

    self.codeMirrorSetup = ZeroHive.codeMirrorViewModel();

    var lockedResult = ko.observable(null);
    var setupSource = ko.observable(null);

    self.locked = ko.observable(false);
    self.locked.subscribe(function(l) {
      if (l) lockedResult(self.result());
      else lockedResult(null);
    });

    self.source = ko.observable(null);

    self.functionArguments = ko.computed(function() {
      var src = '';
      sandbox.functionArguments().forEach(function(a) {
        src += a + ' = undefined\n';
      });
      self.codeMirrorSetup.value(src);
    });


    ko.computed(function() {
      if (self.source() === null) return;
      sandbox.analyze(self.source());
      sandbox.execute(self.source(), self.codeMirrorSetup.value());
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