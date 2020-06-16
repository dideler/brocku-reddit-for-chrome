window.onload = () => {
  setupEvents();
  fetchOrRetrieveLinks();
};

function setupEvents() {
  document.getElementById("submitLink").addEventListener('click', submitCurrentTab, false);
  document.getElementById("refresh").addEventListener('click', refreshLinks, false);
  document.getElementById("options").addEventListener('click', openOptions, false);
  document.getElementById("searchbox").addEventListener('keydown', function(event) {
    searchOnEnter(event);
  });
}

// Updates the feed with submissions if none exist in storage,
// otherwise retrieves submissions from local storage.
function fetchOrRetrieveLinks() {
  // Note that localStorage stores data with no time limit.
  // This means the data will be available indefinitely.
  // This is useful for when you temporarily lose internet access.
  // To store data for one (browser) session, use sessionStorage instead.
  if (localStorage['numLinks'] == null) {
    showLoading();
    buildPopupAfterResponse = true;
    updateFeed();
  } else {
    buildPopup(retrieveLinksFromLocalStorage());
  }
}

// Populates popup.html
function buildPopup(links) {
  // var header = document.getElementById('header');
  var feed = document.getElementById('feed');

  // Sets up issue link.
  var issueLink = document.getElementById('issues');
  issueLink.addEventListener('click', openLinkFront);

  // Sets up title link.
  var title = document.getElementById('title');
  title.addEventListener('click', openLink);

  // Sets up search button.
  var searchButton = document.getElementById('searchbutton');
  searchButton.addEventListener('click', search);

  // Constructs a table and fills it with story links.
  for (var i = 0; i < links.length; i++) {
    var link = links[i]; // FIXME: if broken, remove 'var'
    var row = document.createElement('tr');
    row.className = 'link';
    var num = document.createElement('td');
    num.innerText = String(i + 1).padStart(2, '0') + ".";
    var link_col = document.createElement('td');
    var title = document.createElement('a');
    title.className = 'link_title';
    title.innerText = link.Title;
    title.href = link.Link;
    title.addEventListener('click', openLink);

    link_col.appendChild(title);
    row.appendChild(num);
    row.appendChild(link_col);
    feed.appendChild(row);
  }
  hideElement('spinner');
  showElement('container');
}

// Initiates subreddit search if enter key pressed.
function searchOnEnter(event) {
  const code = event.keyCode || event.which;
  if (code == 13) search();
}

// Searches /r/brocku with the query entered in the searchbox.
function search() {
  var searchBox = document.getElementById('searchbox');
  var keywords = searchBox.value;
  if (keywords.length > 0) {
    var search_url = 'http://www.reddit.com/r/brocku/search?q=' + keywords + '&restrict_sr=on';
    openUrl(search_url, true);
  }
}

// Refreshes the story links in the feed.
function refreshLinks() {
  var linkTable = document.getElementById('feed');

  // Remove all current links.
  while (linkTable.hasChildNodes()) {
    linkTable.removeChild(linkTable.firstChild);
  }

  showLoading();
  buildPopupAfterResponse = true;
  updateFeed();
  updateLastRefreshTime();
}

// Submit the current tab to /r/brocku.
function submitCurrentTab() {
  chrome.windows.getCurrent(function (win) {
    chrome.tabs.getSelected(win.id, function (tab) {
      var submit_url =
        'http://www.reddit.com/r/brocku/submit?resubmit=true' +
        '&url=' +
        encodeURIComponent(tab.url) +
        '&title=' +
        encodeURIComponent(tab.title);
      openUrl(submit_url, true);
    });
  });
}
