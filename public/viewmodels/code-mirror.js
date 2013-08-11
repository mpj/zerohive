if (typeof(ZeroHive) === 'undefined') ZeroHive = {};

(function() {

	ZeroHive.codeMirrorViewModel = function(opts) {
		var self = {};

		var _value = ko.observable('');

		self.value = ko.computed({
			write: function(v) {
				if (typeof v !== 'string')
					throw new Error('Expected string but got' + v)
				_value(v)
			},
			read: _value
		})

		self.isEdited = ko.observable(false);

		return self;
	}

})();