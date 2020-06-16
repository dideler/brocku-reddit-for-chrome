document.addEventListener('DOMContentLoaded', function () {
  restoreOptions();

  Array.from(document.getElementsByClassName('quick-opt')).forEach((option) => {
    option.addEventListener('change', saveOptions, false);
  });

  document
    .getElementById('ClearStorage')
    .addEventListener('click', clearTempStorage, false);
});

var selectReqInterval;
var radioNotifications;
var radioBackgroundTabs;

function initVariables() {
  selectReqInterval = document.getElementById('RequestInterval');
  radioNotifications = document.getElementsByName('Notifications');
  radioBackgroundTabs = document.getElementsByName('BackgroundTabs');
}

// Retrieves stored user values for all the options.
function restoreOptions() {
  initVariables();
  var reqInterval = localStorage['requestInterval'];
  for (var i = 0; i < selectReqInterval.children.length; i++) {
    if (selectReqInterval[i].value == reqInterval) {
      selectReqInterval[i].selected = 'true';
      break;
    }
  }
  var notifications = localStorage['notifications'];
  for (var i = 0; i < radioNotifications.length; i++) {
    if (radioNotifications[i].value == notifications) {
      radioNotifications[i].checked = 'true';
    }
  }
  var backgroundTabs = localStorage['backgroundTabs'];
  for (var i = 0; i < radioBackgroundTabs.length; i++) {
    if (radioBackgroundTabs[i].value == backgroundTabs) {
      radioBackgroundTabs[i].checked = 'true';
    }
  }
}

// Saves all the options to local storage. Called on change for all options.
function saveOptions() {
  var interval =
    selectReqInterval.children[selectReqInterval.selectedIndex].value;
  localStorage['requestInterval'] = interval;

  // Saves the first checked (notification) radio button it comes across.
  for (var i = 0; i < radioNotifications.length; i++) {
    if (radioNotifications[i].checked == true) {
      localStorage['notifications'] = radioNotifications[i].value;
      break;
    }
  }

  for (var i = 0; i < radioBackgroundTabs.length; i++) {
    if (radioBackgroundTabs[i].checked == true) {
      localStorage['backgroundTabs'] = radioBackgroundTabs[i].value;
      break;
    }
  }
}

// Clears temporary storage (everything except settings).
function clearTempStorage() {
  var backgroundTabs = localStorage['backgroundTabs'];
  var notifications = localStorage['notifications'];
  var requestInterval = localStorage['requestInterval'];

  localStorage.clear();

  localStorage['backgroundTabs'] = backgroundTabs;
  localStorage['notifications'] = notifications;
  localStorage['requestInterval'] = requestInterval;

  restoreOptions();
  //refreshLinks();
}
