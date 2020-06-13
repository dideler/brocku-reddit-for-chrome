// Starts the HTTP Request for the first request. Tries again every 60 seconds.
function startRequest() {
  // Initialize firstRequest if it hasn't been done yet.
  if (typeof startRequest.firstRequest == 'undefined') {
    startRequest.firstRequest = true;
  }

  updateIfReady(startRequest.firstRequest);
  startRequest.firstRequest = false;

  window.setTimeout(startRequest, 60000);
}

// If no record of previous usage exists, notify user about notifications.
if (localStorage['notifications'] == null) {
  var notification = webkitNotifications.createHTMLNotification(
    'initialNotification.html'
  );
  notification.show();
  localStorage['notifications'] = false;
}

// Set default options if not already set.
setInitialOption('requestInterval', 1800000); // 30 min intervals
setInitialOption('backgroundTabs', false);

startRequest();
