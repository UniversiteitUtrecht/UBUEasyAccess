/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 */

/**
 * Create an iframe with the notification
 */
//check if iframe is already present
if (document.getElementById("ubu_notification_frame")) {
  //do nothing
}
else {
  var url = window.location.href;
  var iframe = document.createElement('iframe');
  iframe.id = 'ubu_notification_frame';
  iframe.className = 'css-ubu-easy-notification';
  iframe.frameBorder = 0;
  iframe.style.position = "fixed";
  iframe.style.bottom = "10px";
  iframe.style.right = "10px";
  iframe.style.zIndex = 1000;

  if (notetype == 'standard') {
    iframe.style.width = "320px";
    iframe.style.height = "200px";
    iframe.src = chrome.extension.getURL("notification.html?" + url);
  }
  else if (notetype == 'mini') {
    iframe.style.width = "65px";
    iframe.style.height = "65px";
    iframe.src = chrome.extension.getURL("notification_mini.html?" + url);
  }
  else if (notetype == 'site_suggestion') {
    iframe.style.width = "320px";
    iframe.style.height = "200px";
    iframe.src = chrome.extension.getURL("suggestedsites.html");
  }
  else {
    iframe.style.width = "65px";
    iframe.style.height = "65px";
    iframe.src = chrome.extension.getURL("notification_mini.html?" + url);
  }
  document.body.appendChild(iframe);
}

/**
 * Listen to events in the iframe
 */
chrome.runtime.onMessage.addListener(function (message) {
  iframe.style.display = 'none';
  if (message.demand && message.demand == 'redirect') {
    var newUrl = message.text;
    window.location.href = newUrl;
  }
  if (message.demand && message.demand == 'hide_popup') {
    iframe.style.display = 'none';
  }
});

/**
 * Make the notification disappear after a certain number of seconds
 */
if (notetype == 'standard') {
  setTimeout(function () {
    fadeOut(iframe, 2000);
  }, 5000);
}

/**
 * The 'disappear' code
 */
function fadeOut(el, duration) {

  /*
   * @param el - The element to be faded out.
   * @param duration - Animation duration in milliseconds.
   */

  var step = 10 / duration,
    opacity = 1;

  function next() {
    if (opacity <= 0) {
      return;
    }
    el.style.opacity = ( opacity -= step );
    setTimeout(next, 10);
  }

  next();
}