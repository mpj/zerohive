ko.bindingHandlers.codeMirror = {
    init: function(element, valueAccessor) {
      var viewModel = ko.unwrap(valueAccessor());

      var options = {
        mode:  'javascript',
        tabSize: 2
      };

      element.__codeMirror = CodeMirror.fromTextArea(element, options);

      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        
        // Get rid of the element created by codemirror
        var wrapper = element.__codeMirror.getWrapperElement();
        wrapper.parentNode.removeChild(wrapper);

        var eventHandler = element.__codeMirror.__onChange;
        if (eventHandler) vm.off('change',  eventHandler);

        var subscription = element.__codeMirror.__subscription;
        if (subscription) subscription.dispose();

        element.__codeMirror = null;        
      });
      
    },
    update: function(element, valueAccessor) {
      var codeMirror = element.__codeMirror;

      var value = ko.unwrap(valueAccessor());
      if (value === codeMirror.__viewModel) return;

      codeMirror.__viewModel = value;

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
      codeMirror.on('change', codeMirror.__onChange);

      codeMirror.setValue(codeMirror.__viewModel.value());
    }
};

