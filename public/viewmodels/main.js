if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

  ZeroHive.mainViewModel = function() {
    var self = {};

    self.codeMirror = ZeroHive.codeMirrorViewModel();

    self.newCase = ko.observable(null);
    self.sandbox = Sandbox.facade();


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
    


    var hasEmptyCases = ko.computed(function() {
        return self.cases().filter(function(c) {
          return !c.isEdited();
        }).length > 0;
    });

    ko.computed(function() {
      if(!hasEmptyCases()) setTimeout(createCase,10);
    });

    function createCase(conditions, expectation) {
      self.cases.push(ZeroHive.caseViewModel(conditions, expectation));
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
        createCase(c.conditions, c.expectation);
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