/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 */

/**
 * Build the redirect URL
 *
 * @param url
 * @returns {string}
 */
var getRedirectUrl = function (url) {
  	var proxy = "https://login.proxy.library.uu.nl/login?utm_source=ezxs&qurl=";
  	return proxy + encodeURIComponent(url);
};

(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
  a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-[your profile id]', 'auto');
ga('set', 'checkProtocolTask', null); //to make it work with extension, rather than http
ga('send', 'pageview', 'suggestedsites.html');

/**
 * Start
 * Show links with suggested pages
 */
document.addEventListener('DOMContentLoaded', function () {
  	var relatedUrl = localStorage['related'];
  	var onCampus = localStorage['oncampus'];
  	var onProxy = localStorage['onproxy'];

  	var showRelatedName = '';
  	if (relatedUrl === 'http://academic.lexisnexis.nl') {
    	showRelatedName = 'Lexis Nexis Academic for UU';
  	}
  	else if (relatedUrl === 'http://uu.vandale.nl/zoeken/zoeken.do') {
    	showRelatedName = 'Van Dale dictionary for UU';
  	}

  	var suggestionText = showRelatedName + "?";

  	document.getElementById("suggested_site").innerText = suggestionText;

  	if (onCampus == 'yes' || onProxy == 'on') {
    	document.getElementById("note_suggestion_button").href = relatedUrl;
  	}
  	else {
    	document.getElementById("note_suggestion_button").href = getRedirectUrl(relatedUrl);
  	}
});

/**
 * Listen to the suggestion button
 * Redirected to the suggested page
 */
document.getElementById("note_suggestion_button").addEventListener("click", function () {
  	var redirectUrl = document.getElementById("note_suggestion_button").href;
  	ga('send', 'event', 'inpage_site_suggestion', 'clicked', localStorage['related']);
  	chrome.runtime.sendMessage({demand: "redirect", text: redirectUrl});
});

/**
 * Listen to the 'no suggestions' button
 * The user will no longer get suggestions for other pages
 */
document.getElementById("stop_suggestions_button").addEventListener("click", function () {
  	chrome.storage.sync.set({
    	showSuggested: false
  	});

	ga('send', 'event', 'stop_suggestion_button', 'clicked');

  	document.getElementById("note_suggestion_button").setAttribute('disabled', 'disabled');
  	document.getElementById("no_more_suggestions").innerHTML = '<div class="pure-alert pure-alert-success">No more suggestions will be shown.</div>';
  	document.getElementById("suggested_site").innerHTML = '';

  	//wait a few seconds, then close popup
   	setTimeout(function () {
    	chrome.runtime.sendMessage({demand: "hide_popup"});
  	}, 5000);
});
