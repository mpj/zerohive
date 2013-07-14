if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

	ZeroHive.mainViewModel = function() {
		var self = {};

		self.codeMirror = ZeroHive.codeMirrorViewModel();
		self.codeMirror.value(
			'function square(x, y) {\n' +
			'  return x * y;\n' +
			'}');

		self.notification = {
			text: ko.observable('This is an error'),
			visible: ko.observable(true),
			class: 'error'
		};

		return self;
	};

})();