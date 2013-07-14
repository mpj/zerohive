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

		ko.computed(function() {
			self.sandbox.analyze(self.codeMirror.value());
		});

		self.notification = {
			text: ko.computed(function() {
        if (self.sandbox.isFunction() === false) return 'Your code must evaluate to a function'
        if (self.sandbox.errorMessage() !== 'null') return self.sandbox.errorMessage();

      }),
			visible: ko.observable(true),
			class: 'error'
		};

		return self;
	};

})();