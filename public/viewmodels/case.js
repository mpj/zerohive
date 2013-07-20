if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.caseViewModel = function() {
    var self = {};

    var sandbox = Sandbox.facade();

    self.codeMirrorSetup = ZeroHive.codeMirrorViewModel();
    self.codeMirrorVerification = ZeroHive.codeMirrorViewModel();
    self.codeMirrorResult = ZeroHive.codeMirrorViewModel();

    var expectedResult = ko.observable(null);
    var setupSource = ko.observable(null);


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
      // String comparison might not fly in the long run, I think
      var expected = self.codeMirrorVerification.value();
      if (!expected || expected.trim().length === 0) return null;
      return _.isEqual('' + sandbox.result(), expected);
    });

    self.verificationClass = ko.computed(function() {
      if (pass() === null) return '';
      return pass() ? 'pass' : 'fail';
    });

    self.codeMirrorResult.value.fill(function() {
      return '' + sandbox.result();
    });









    return self;
  };

})();