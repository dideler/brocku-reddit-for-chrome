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
  chrome.notifications.create('initial-notification', {
    type: 'basic',
    iconUrl: 'images/webstore-icon-128x128.png',
    title: '/r/brocku post notifications',
    message: 'Notifications can be disabled in the extension options',
    requireInteraction: true,
    silent: false,
    buttons: [ { title: 'Options' } ]
  });

  localStorage['notifications'] = true;
}

// Setup event handler for 'Options' button on post-install notification.
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
  if (notificationId == 'initial-notification' && buttonIndex == 0) {
    chrome.runtime.openOptionsPage();
  }
});

// Set default options if not already set.
setInitialOption('requestInterval', 1800000); // 30 min intervals
setInitialOption('backgroundTabs', false);

startRequest();
