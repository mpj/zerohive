ko.bindingHandlers.sandbox = {
    init: function(element, valueAccessor) {
      var viewModel = ko.unwrap(valueAccessor());

      // Note: to actually have multiple instances here, you need different domains
      var uniqueId = "sandbox-" + Math.floor((Math.random() * 1000000) + 1).toString();

      var src = viewModel.authority + '/' + viewModel.path;
      console.log("src", src);
      var htmlStr = '' +
        '<iframe ' +
        'src="'+ src + '" ' +
        'id="'+ uniqueId +'" ' +
        'style="height:0;width:0;position:absolute;"></iframe> ';
      var newNode = ko.utils.parseHtmlFragment(htmlStr)[0];
      element.parentNode.replaceChild(newNode, element);

      var sandboxWindow = document.getElementById(uniqueId).contentWindow;

      function onReady() {
        console.log("ready!")
        viewModel.onSendRequest(function(messageData) {
          console.log("Sending message...")
          sandboxWindow.postMessage(messageData, viewModel.authority  + '/');
        });
      }
     
      window.addEventListener('message', function(event) {
        if (event.origin !== viewModel.authority) return;

        // Special message ready sent by iframe when it's loaded
        if (event.data.type === 'ready') {
          onReady();
          return;
        }

        viewModel.receive(event.data);
      }, false);
    }
};
ko.virtualElements.allowedBindings.sandbox = true;
