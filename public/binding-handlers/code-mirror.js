ko.bindingHandlers.codeMirror = {
    init: function(element, valueAccessor) {
      var viewModel = ko.unwrap(valueAccessor());

      var options = {
        mode:  'javascript',
        tabSize: 2
      };

      element.__codeMirror = CodeMirror.fromTextArea(element, options);

      // When knockout removes the container element from the DOM
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        
        // Get rid of the element created by codemirror
        var wrapper = element.__codeMirror.getWrapperElement();
        wrapper.parentNode.removeChild(wrapper);

        // Shut off the event listeners
        element.__codeMirror.off('change', element.__codeMirror.__onChange);
        element.__codeMirror.off('keyup', element.__codeMirror.__onKeyUp);

        // Stop the value subscription.
        element.__codeMirror.__subscription.dispose();

        // Finally, remove the codemirror handle to 
        // prevent any circular reference. 
        element.__codeMirror = null;
      });
      
    },
    update: function(element, valueAccessor) {
      var codeMirror = element.__codeMirror;

      var viewModel = ko.unwrap(valueAccessor());
      if (viewModel === codeMirror.__viewModel) return;

      codeMirror.__viewModel = viewModel;

      // viewModel -> codeMirror
      if (codeMirror.__subscription) codeMirror.__subscription.dispose();
      codeMirror.__subscription = codeMirror.__viewModel.value.subscribe(function(v) {
        if (v !== codeMirror.getValue()) { codeMirror.setValue(v); }
      })

      // codeMirror -> viewModel
      if (codeMirror.__onChange) codeMirror.off('change', codeMirror.__onChange);
      codeMirror.__onChange = function() { 
        codeMirror.__viewModel.value(codeMirror.getValue()); 
      };
      codeMirror.__onKeyUp = function() {
        codeMirror.__viewModel.isEdited(true);
      }
      codeMirror.on('change', codeMirror.__onChange);
      codeMirror.on('keyup',  codeMirror.__onKeyUp);

      codeMirror.setValue(codeMirror.__viewModel.value());

    }
};

