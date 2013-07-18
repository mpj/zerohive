if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.mainViewModel = function() {
    var self = {};

    self.codeMirror = ZeroHive.codeMirrorViewModel();
    self.codeMirror.value(
      'function multiply(x, y) {\n' +
      '  return x * y;\n' +
      '}');

    self.newCase = ko.observable(null);
    self.sandbox = Sandbox.facade();
    
    ko.computed(function() {
      if (self.newCase() === null) return;
      var source = self.codeMirror.value();
      self.sandbox.analyze(source);
      self.newCase().source(source);
    });

    ko.computed(function() {
      self.newCase(ZeroHive.caseViewModel(self.sandbox.functionArguments()));
    });

    self.notification = {
      text: ko.computed(function() {
        if (self.sandbox.isFunction() === false) return 'Your code must evaluate to a function';
        if (self.sandbox.errorMessage() !== 'null') {
          var message = self.sandbox.errorMessage();
          if (self.sandbox.errorLine())
            message = "Line " + self.sandbox.errorLine() + ": " + message;
          return message;
        }

      }),
      visible: ko.observable(true),
      class: 'error'
    };

    return self;
  };

})();