// TODO: consider using namespaces for global code (e.g. var rss = {}; rss.feedURL = 'http://...'; )

var feedUrl = 'http://www.reddit.com/r/brocku/.rss';
var maxFeedItems = 10;
var req;
var buildPopupAfterResponse = false;
var OnFeedSuccess = null;
var OnFeedFail = null;
var retryMilliseconds = 120000;

// Sets the initial options by storing the key and value in local storage.
function setInitialOption(key, value)
{
  if (localStorage[key] == null)
  {
    localStorage[key] = value;
  }
}

// Updates the feed if forced, or if it hasn't been updated before, or if it's due time.
function updateIfReady(force)
{
  var lastRefresh = parseFloat(localStorage["HN.LastRefresh"]);
  var interval = parseFloat(localStorage["HN.RequestInterval"]);
  // Also update if current time > time at which next refresh should happen.
  var refresh = parseFloat((new Date()).getTime()) > (lastRefresh + interval);
  var noPrevRefresh = (localStorage["HN.LastRefresh"] == null);
  if (force || noPrevRefresh || refresh)
  {
    updateFeed();
  }
}

// Updates the feed using an HTTP GET request to the subreddit's RSS feed.
function updateFeed()
{
  req = new XMLHttpRequest();
  req.onload = onLoad;
  req.onerror = onError;
  req.open("GET", feedUrl, true);
  req.send(null);
}

// Stores the most recent refresh timestamp. Called after a manual or auto refresh.
function updateLastRefreshTime()
{
  localStorage["HN.LastRefresh"] = (new Date()).getTime();
}

// Displays the loader animation.
function showLoading()
{
  toggle("container");
  toggle("spinner");
}

// Handles the RSS HTTP response. Part of updating the feed.
function onLoad()
{
  var doc = req.responseXML;
  if (!doc)
  {
    doc = parseXml(req.responseText);
  }
  if (!doc)
  {
    handleFeedParsingFailed("Not a valid feed.");
    return;
  }

  // Retrieves parsed links then saves them.
  links = parseHNLinks(doc);
  saveLinksToLocalStorage(links);
 	
  // Notifies the user if option enabled and if there's a new frontpage submission.
  if (localStorage['HN.Notifications'] == 'true')
  {
    if (localStorage['HN.LastNotificationTitle'] == null || localStorage['HN.LastNotificationTitle'] != links[0].Title)
    {
      showLinkNotification(links[0]);
      localStorage['HN.LastNotificationTitle'] = links[0].Title;
    }
  }

  if (buildPopupAfterResponse == true)
  {
    buildPopup(links);
    buildPopupAfterResponse = false;
  }

  updateLastRefreshTime();
}

// Prints a debug message along with the time. (not being used at the moment)
function debugMessage(message)
{
  var notification = webkitNotifications.createNotification(
    "icon48.png",
    "DEBUG",
    printTime(new Date()) + " :: " + message
  );
  notification.show();
}

// Creates a desktop notification which links to the newest front page submission.
function showLinkNotification(link)
{
  var notification = webkitNotifications.createHTMLNotification("notification.html");
  notification.show();
}

function onError()
{
  handleFeedParsingFailed('Failed to fetch RSS feed.');
}

// Updates the last refresh timestamp.
function handleFeedParsingFailed(error)
{
  //var feed = document.getElementById("feed");
  //feed.className = "error"
  //feed.innerText = "Error: " + error;
  localStorage["HN.LastRefresh"] = localStorage["HN.LastRefresh"] + retryMilliseconds;
}

function parseXml(xml)
{
  var xmlDoc;
  try
  {
    xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
    xmlDoc.async = false;
    xmlDoc.loadXML(xml);
  }
  catch (e) { xmlDoc = (new DOMParser).parseFromString(xml, 'text/xml'); }

  return xmlDoc;
}

// Parses the rss links and returns a list of links.
function parseHNLinks(doc)
{
  var entries = doc.getElementsByTagName('entry');
  if (entries.length == 0)
  {
    entries = doc.getElementsByTagName('item');
  }
  var count = Math.min(entries.length, maxFeedItems);
  var links = [];
  for (var i=0; i< count; i++)
  {
    item = entries.item(i);
    var link = new Object();

    // Grabs the submission's title.
    var itemTitle = item.getElementsByTagName('title')[0];
    if (itemTitle)
    {
      link.Title = itemTitle.textContent;
    }
    else
    {
      link.Title = "Unknown Title";
    }
    
    // Grabs the submissions's link.
    var itemLink = item.getElementsByTagName('link')[0];
    if (itemLink)
    {
      link.Link = itemLink.textContent;
    }
    else
    {
      link.Link = '';
    }
    
    links.push(link);
  }
  return links;
}

// Stores the number of links and the links.
function saveLinksToLocalStorage(links)
{
  localStorage["HN.NumLinks"] = links.length;
  for (var i=0; i<links.length; i++)
  {
    localStorage["HN.Link" + i] = JSON.stringify(links[i]);
  }
}

// Retrieves stored links.
function retrieveLinksFromLocalStorage()
{
  var numLinks = localStorage["HN.NumLinks"];
  if (numLinks == null)
  {
    return null;
  }
  else
  {
    var links = [];
    for (var i=0; i<numLinks; i++)
    {
      links.push(JSON.parse(localStorage["HN.Link" + i]))
    }
    return links;
  }
}

// Opens the options page.
function openOptions()
{
  var optionsUrl = chrome.extension.getURL('options.html');
  chrome.tabs.create({url: optionsUrl});
}

// Opens the link in a new background tab.
function openLink()
{
  openUrl(this.href, (localStorage['HN.BackgroundTabs'] == 'false'));
}

// Opens the link in a new foreground tab.
function openLinkFront()
{
  openUrl(this.href, true);
}

// Returns a string of the current time. Used in debug messages.
function printTime(d)
{
  var hour = d.getHours();
  var minute = d.getMinutes();
  // Convert to 12-hour format.
  var ap = (hour > 11) ? "PM" : "AM"; // 0-11 is AM, 12-23 is PM.
  if (hour > 12)
  {
    hour -= 12;
  }
  if (hour == 0)
  {
    hour = 12;
  }
  if (minute < 10)
  {
    minute = "0" + minute;
  }
  var timeString = hour + ':' + minute + " " + ap;
  return timeString;
}

// Opens URL in a new tab in the background or foreground.
function openUrl(url, take_focus)
{
  // Only allow http and https.
  if (url.indexOf("http:") == 0 || url.indexOf("https:") == 0)
  {
    chrome.tabs.create({url: url, selected: take_focus});
  }
}

function hideElement(id)
{
  document.getElementById(id).style.display = 'none';
}

function showElement(id)
{
  document.getElementById(id).style.display = 'block';
}

// Shows or hides the element.
function toggle(id)
{
  var e = document.getElementById(id);
  if (e.style.display == 'block')
  {
    e.style.display = 'none';
  }
  else
  {
    e.style.display = 'block';
  }
}
