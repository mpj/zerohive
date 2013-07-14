if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

	ZeroHive.codeMirrorViewModel = function(opts) {
		var self = {};

		self.value = ko.observable('');

		return self;
	}

})();