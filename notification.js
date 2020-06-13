function SetupNotification() {
  var link = JSON.parse(localStorage['link.0']);
  var storyLink = document.getElementById('StoryLink');
  storyLink.href = link.Link;
  storyLink.innerText = link.Title;
  storyLink.addEventListener('click', openLinkFront);
}

SetupNotification();
