ko.bindingHandlers.codeMirror = {
    init: function(element, valueAccessor) {
      var viewModel = ko.unwrap(valueAccessor());

      var options = {
        mode:  'javascript',
        tabSize: 2
      };

      var codeMirror = element.__codeMirror = 
        CodeMirror.fromTextArea(element, options);

      codeMirror.__viewModel = ko.observable(viewModel);

      // When codeMirror input chnages, transfer value to value() observable
      // on the viewMode.
      var onChange = function() { codeMirror.__viewModel().value(codeMirror.getValue()); };
      codeMirror.on('change', onChange);
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        var wrapper = codeMirror.__viewModel().getWrapperElement();
        wrapper.parentNode.removeChild(wrapper);
        codeMirror.__viewModel().off('change', onChange);
        codeMirror.__viewModel(null);
      });

      // The inverse of onChange - transfer viewModel value changes to codeMirror
      ko.computed({
        read: function() {
          // Ignore if same, or we'd have infinite loops of changes
          var val = codeMirror.__viewModel().value();
          if (val === codeMirror.getValue()) return;
          codeMirror.setValue(val);
        }, disposeWhenNodeIsRemoved: element
      });
      
    },
    update: function(element, valueAccessor) {
      element.__codeMirror.__viewModel(ko.unwrap(valueAccessor()));
    }
};

