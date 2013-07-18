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

    self.cases = ko.observableArray();

    ko.computed(function() {
      var source = self.codeMirror.value();
      self.sandbox.analyze(source);

      self.cases().forEach(function(c) {
        c.source(source);
      });

    });

    var noOpenCases = ko.computed(function() {
      return self.cases().filter(function(c) {
        return !c.locked();
      }).length === 0;
    });

    ko.computed(function() {
      if(noOpenCases()) setTimeout(createCase,10);
    });

    function createCase() {
      self.cases.push(ZeroHive.caseViewModel());
    }

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