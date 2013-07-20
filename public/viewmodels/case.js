if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.caseViewModel = function() {
    var self = {};

    var sandbox = Sandbox.facade();

    self.codeMirrorSetup = ZeroHive.codeMirrorViewModel();
    self.codeMirrorVerification = ZeroHive.codeMirrorViewModel();
    self.codeMirrorResult = ZeroHive.codeMirrorViewModel();


    var expectedResult = ko.computed(function() {
      var expected = self.codeMirrorVerification.value();
      if (expected === '') return null;
      return expected;
    })


    var setupSource = ko.observable(null);

    self.selected = ko.observable(false);

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
      
      if (!expectedResult()) return null;
      return _.isEqual('' + sandbox.result(), expectedResult());
    });

    self.verificationClass = ko.computed(function() {
      if (pass() === null) return '';
      return pass() ? 'pass' : 'fail';
    });

    self.codeMirrorResult.value.fill(function() {
      return '' + sandbox.result();
    });

     self.iconClass = ko.computed(function() {
      if (expectedResult() === null) 
        return self.selected() ? 'icon-error-alt' : 'icon-error';
      if (!pass()) {
        return self.selected() ? 'icon-remove-sign' : 'icon-remove-circle';
      }
      return self.selected() ? 'icon-ok-sign' : 'icon-ok-circle';
    })


    self.isNew = ko.computed(function() {
      return !expectedResult();
    })








    return self;
  };

})();