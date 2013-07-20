ko.bindingHandlers.codeMirror = {
    init: function(element, valueAccessor) {
      var viewModel = ko.unwrap(valueAccessor());

      var options = {
        mode:  'javascript',
        tabSize: 2
      };

      var codeMirror = CodeMirror.fromTextArea(element, options);

      // When codeMirror input chnages, transfer value to value() observable
      // on the viewMode.
      var onChange = function() { viewModel.value(codeMirror.getValue()); };
      codeMirror.on('change', onChange);

      // The inverse of onChange - transfer viewModel value changes to codeMirror
      ko.computed(function() {
        // Ignore if same, or we'd have infinite loops of changes
        if (viewModel.value() === codeMirror.getValue()) return;
        codeMirror.setValue(viewModel.value());
      }).disposeWhenNodeIsRemoved(element);

      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        var wrapper = codeMirror.getWrapperElement();
        wrapper.parentNode.removeChild(wrapper);
        codeMirror.off('change', onChange);
      });
    }
};

