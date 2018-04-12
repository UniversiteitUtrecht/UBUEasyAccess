/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 * Code behind the popup page
 */

// Google Analytics
var getRedirectUrl = chrome.extension.getBackgroundPage().getRedirectUrl;

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

ga('create', '[your profile]', 'auto');
ga('set', 'anonymizeIp', true);
ga('set', 'checkProtocolTask', null); //to make it work with extension, rather than http
ga('send', 'pageview', 'notification.html');

/**
 * Get the current URL
 */
function getCurrentTabUrl(callback) {
  	var queryInfo = {
    	active: true,
    	currentWindow: true
  	};

  	chrome.tabs.query(queryInfo, function (tabs) {
    	var tab = tabs[0];
    	var url = tab.url;
    	callback(url);
  	});
}

/**
 * Save if the current page is PubMed
 */
function saveStoragePubmed(value) {
  localStorage['pubmed'] = value;
}

/**
 * Determine which elements on the page to show
 */
document.addEventListener('DOMContentLoaded', function () {
  	var qualify = localStorage['qualify'],
    	onCampus = localStorage['oncampus'],
    	toProxy = localStorage['toproxy'],
    	onProxy = localStorage['onproxy'],
    	onPubmed = localStorage['pubmed'];
    	onBiblio = localStorage['bibe'];


  	  //Display based on network status
  	  if (onCampus == 'yes') {
    	  document.getElementById('out-net').style.display = "none";
    	  document.getElementById('in-net').style.display = "block";
  	  }
	  else {
    	  document.getElementById('out-net').style.display = "block";
    	  document.getElementById('in-net').style.display = "none";
  	  }

  	if (onProxy == 'on') {
    	$('#on-proxy').show();
    	$('#no-proxy').hide();
    	$('#proxy').hide();
  	} 
	else {
    	$('#on-proxy').hide();

    	//only show the button if we have a redirect url
		if (getRedirectUrl != '') {
	    	if (toProxy == "yes") {
	      		document.getElementById('proxy').style.display = "block";
	      		document.getElementById('no-proxy').style.display = "none";
	    	} 
			else {
	      	  	document.getElementById('proxy').style.display = "none";
	      		document.getElementById('no-proxy').style.display = "block";
	    	}
				
			if (qualify == 'yes') {
      	  		document.getElementById("popup_loginbutton").classList.add("button-green");
      			document.getElementById("popup_loginbutton").removeAttribute('disabled');

      			getCurrentTabUrl(function (url) {
        			document.getElementById("popup_loginbutton").href = getRedirectUrl(url);
      	    	});
			}
	    	else {
	    		document.getElementById("popup_loginbutton").classList.remove("button-green");
	      		document.getElementById("popup_loginbutton").setAttribute('disabled', 'disabled');
	    	}
    	}
    	else {
      	  	document.getElementById("popup_loginbutton").classList.remove("button-green");
      	  	document.getElementById("popup_loginbutton").setAttribute('disabled', 'disabled');
    	}
  	}

  	/*
   	* Special case Bibliograaf
   	* If the user is not on campus, show this text to explain what's on the page
   	*/
  	if (onBiblio == 'yes' && onCampus == 'no') {
	  	document.getElementById('searchenginepage').style.display = "block";
	  	document.getElementById('no-proxy').style.display = "none";
  	}

  	/*
   	* Special case PubMed. 
   	* Show this extra button only if user is on campus; else they will get the normal
   	* login button, which has the same effect
   	*/
  	if (onPubmed == 'new' && onCampus == 'yes') {
    	document.getElementById('pubmed').style.display = "block";
    	document.getElementById("popup_loginbutton_pubmed").classList.add("button-green");
    	document.getElementById("popup_loginbutton_pubmed").removeAttribute('disabled');

    	getCurrentTabUrl(function (url) {
      	  document.getElementById("popup_loginbutton_pubmed").href = getRedirectUrl(url);
    	});
  	}
  	else {
    	document.getElementById('pubmed').style.display = "none";
    	document.getElementById("popup_loginbutton_pubmed").classList.remove("button-green");
    	document.getElementById("popup_loginbutton_pubmed").setAttribute('disabled', 'disabled');
  	}
});

/**
 * Listen to the login button
 */
document.getElementById("popup_loginbutton").addEventListener("click", function () {
    chrome.extension.getBackgroundPage().getUserPreferences(function (userPreferences) {
      	ga('send', 'event', 'popup_loginbutton', 'clicked', 'notifications ' + (userPreferences.showNotification ? 'on' : 'off'));
    });
    getCurrentTabUrl(function (url) {
    	ga('send', 'event', 'popup_loginbutton', 'clicked', 'url', url);
   });

  	var redirectUrl = document.getElementById("popup_loginbutton").href;

  	//if the redirectUrl is for PubMed, store the fact that we have visited PubMed
  	if (redirectUrl.indexOf('pubmed') > -1) {
    	saveStoragePubmed('visited');
  	}
  	chrome.tabs.update({url: redirectUrl});
});

/**
 * Listen to the PubMed button
 */
document.getElementById("popup_loginbutton_pubmed").addEventListener("click", function () {
  	saveStoragePubmed('visited');

  	var redirectUrl = document.getElementById("popup_loginbutton_pubmed").href;
  	chrome.tabs.update({url: redirectUrl});

  	chrome.extension.getBackgroundPage().getUserPreferences(function (userPreferences) {
    	ga('send', 'event', 'popup_loginbutton_pubmed', 'clicked', 'notifications ' + (userPreferences.showNotification ? 'on' : 'off'));
  	});
});

/**
 * Listen to the options button
 */
document.getElementById("go-to-options").addEventListener("click", function () {
  	if (chrome.runtime.openOptionsPage) {
    	chrome.runtime.openOptionsPage();
  	}
  	else {
    	window.open(chrome.runtime.getURL('options.html'));
  	}
});
