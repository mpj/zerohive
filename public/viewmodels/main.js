if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.mainViewModel = function() {
    var self = {};

    self.codeMirror = ZeroHive.codeMirrorViewModel();

    self.newCase = ko.observable(null);
    self.sandbox = createSandbox();


    self.caseClicked = function() {
      self.activeCase(this);
    }

    self.cases = ko.observableArray();

    ko.computed(function() {
      var source = self.codeMirror.value();
      self.sandbox.analyze(source);

      self.cases().forEach(function(c) {
        c.source(source);
      });

    });

    self._activeCase = ko.observable(null);
    self.activeCase = ko.computed({
      read: function() {
        return self._activeCase();
      },
      write: function(c) {
        if (self._activeCase()) self._activeCase().selected(false);
        self._activeCase(c);
        self._activeCase().selected(true);
      }
    })
    



    var shouldCreateNewCase = function() {
      if (self.cases().length === 0)
        return false // Not loaded yet
      for (var i = 0; i < self.cases().length; i++)
        if (!self.cases()[i].isEdited()) return false
      return true;
    };

    ko.computed(function() {
      if(shouldCreateNewCase()) setTimeout(createCase,10);
    });

    function createCase(conditions, expectation) {
      var c = ZeroHive.caseViewModel(conditions, expectation)
      self.cases.push(c);
      return c;
    }

    self.notification = {
      text: ko.computed(function() {
        if (self.activeCase() && self.activeCase().sandbox.errorMessage())
          return self.activeCase().sandbox.errorMessage();
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

    self.saveClicked = function() {
      var m = document.URL.match(/(\w+)\/(\w+)$/);
      var id = m[1];

      var ground = {
        body: self.codeMirror.value(),
        cases: []
      }

      self.cases().forEach(function(c) {
        var setupSource = c.codeMirrorSetup.value()
        var verificationSource = c.codeMirrorVerification.value();
        ground.cases.push({
          conditions: setupSource,
          expectation: verificationSource
        })
      })

      post('/' + id, {ground: ground }, function(responseText, location) {
        window.history.pushState("SOMESTATE", "Title", location);
      })
    }



    var xhr = function() {
      var xhr = new XMLHttpRequest()
      var IS_FINISHED = 4
      return function( method, url, data, callback ) {
          xhr.onreadystatechange = function() {

            if ( xhr.readyState === IS_FINISHED ) {
              var location = xhr.getResponseHeader('Location');
              callback( xhr.responseText , location)
            }
              
          }
          xhr.open( method, url )
          xhr.send(JSON.stringify(data));
      }
    }()

    var post = function(url, data, callback) {
      return xhr('POST', url, data, callback);
    }

    var m = document.URL.match(/(\w+)\/(\w+)$/);
    var id = m[1];
    var versionNumber = m[2];
    var path = '/' + id + '/' + versionNumber + '.json';
    xhr('GET', path, null, function(str) {
      var obj = JSON.parse(str);
      if (!obj.body) {
        console.log("body was null", obj)
      }
      obj.cases.forEach(function(c) {
        var nc = createCase(c.conditions, c.expectation);
        nc.isEdited(true);
      })
      self.codeMirror.value(obj.body);
    });

    return self;
  };

})();

ko.observable.fn.fill = function(fn) {
  return ko.computed(function() {
    this(fn());
  }, this);
};

ko.computed.fn.fill = ko.observable.fn.fill