ko.bindingHandlers.codeMirror = {
    init: function(element, valueAccessor) {
      var viewModel = ko.unwrap(valueAccessor());
      var codeMirror = CodeMirror(function(elt) {
        element.parentNode.replaceChild(elt, element);
      }, {
        mode:  'javascript',
        tabSize: 2
      });

      codeMirror.on('change', function() {
        viewModel.value(codeMirror.getValue());
      });

      ko.computed(function() {
        if (viewModel.value() === codeMirror.getValue()) return;
        codeMirror.setValue(viewModel.value());
      });
    }
};

