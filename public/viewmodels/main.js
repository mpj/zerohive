if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.mainViewModel = function() {
    var self = {};

    self.codeMirror = ZeroHive.codeMirrorViewModel();
    self.codeMirror.value(
      'function square(x, y) {\n' +
      '  return x * y;\n' +
      '}');

    self.sandbox = ZeroHive.sandboxViewModel({
      authority: 'http://sandbox.zerohive.local:5000',
      path: 'evaluator.html'
    });

    self.newCase = ko.observable(null);

    ko.computed(function() {
      self.newCase(ZeroHive.caseViewModel(self.sandbox.functionArguments()));
    });

    ko.computed(function() {
      self.sandbox.analyze(self.codeMirror.value());
    });

    ko.computed(function() {
      if (self.newCase() === null) return;
      var argumentValues = self.newCase().functionArguments.map(function(a) {
        return a.value();
      });
      self.sandbox.execute(self.codeMirror.value(), argumentValues);
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