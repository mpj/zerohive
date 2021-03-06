if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.caseViewModel = function(conditions, expectation) {
    var self = {};

    var sandbox = self.sandbox = createSandbox();

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
      if (self.codeMirrorSetup.value() !== '')  {
        // Don't overwrite if there is an existing value
        return
      }
      var src = '';
      sandbox.functionArguments().forEach(function(a) {
        src += a + ' = undefined\n';
      });
      self.codeMirrorSetup.value(src);
    });


    ko.computed(function() {
      if (self.source() !== null) sandbox.analyze(self.source());
    })

    ko.computed(function() {
      if (sandbox.isFunction()) 
        sandbox.execute(self.source(), self.codeMirrorSetup.value());
    })

          
        

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
      var r = sandbox.result();
      
      // Let the special cases begin!
      if (_.isArray(r) && r.length === 0)
        return '[]';

      return '' + r;
    });

     self.iconClass = ko.computed(function() {
      if (expectedResult() === null) 
        return self.selected() ? 'icon-error-alt' : 'icon-error';
      if (!pass()) {
        return self.selected() ? 'icon-remove-sign' : 'icon-remove-circle';
      }
      return self.selected() ? 'icon-ok-sign' : 'icon-ok-circle';
    })

    var _isEdited = ko.observable(null);
    self.isEdited = ko.computed({
      read: function() {
        if (_isEdited() === null)
          return  self.codeMirrorSetup.isEdited() || 
                  self.codeMirrorVerification.isEdited()
        return _isEdited()
      },
      write: _isEdited
    })

    if (conditions && expectation) {
      self.codeMirrorSetup.value(conditions);
      self.codeMirrorVerification.value(expectation);
    }

    return self;
  };

})();