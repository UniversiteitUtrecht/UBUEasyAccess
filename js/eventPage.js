/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 * this page will listen to things that interest us
 * in practice that means: whenever the URL of the page changes
 * if it does: check if it is in the list of URLs to proxy
 * if it is in the list: check if user is on campus
 * if yes: show notification  
 * and show a login button on the popup screen
*/


/**
 * Google Analytics
 *
 * Instantiate GA once in the background page.
 * It can be retrieved in every script with:
 *    chrome.extension.getBackgroundPage().ga
 *
 * In this way GA messages will be attached and traceable in the background page
 */
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

ga('create', '[your GA profile]', 'auto');
ga('set', 'anonymizeIp', true);
ga('set', 'checkProtocolTask', null); //to make it work with extension, rather than http


/**
 * Build the redirect URL
 *
 * @param url
 * @returns {string}
 */
var getRedirectUrl = function (url) {
	//this is where you put the url to the login page
	// if your institution uses EZProxy, the url will look something like this:  
  	var proxy = "https://login.proxy.library.uu.nl/login?utm_source=ezxs&qurl=";
  
  	/**
   	 * Special cases
   	 */
  	//if scholar.google add /ncr to the redirecturl
  	if (url.indexOf("scholar") == 0) {
    	url = url + 'ncr';
  	}

  	//If Pubmed use a specific url
  	if (url.indexOf('www.ncbi.nlm.nih.gov') > -1) {
    	url = 'http://www.ncbi.nlm.nih.gov/pubmed?otool=inluulib';
  	}

  	//off campus access to WebOfKnowledge will send you to a login page that can't be proxied
  	//so redirect to proxied start page
  	if (url.indexOf('login.webofknowledge.com') > -1) {
    	url = 'http://apps.webofknowledge.com';
  	}
  	return proxy + encodeURIComponent(url);
};


/**
 * urlsList is defined in urls.min.js
 * edit that list to reflect your institutions licenses
 *
 * scopus has its own popup for UU
 * webofknowledge redirects you to a login page
 * for the first version, we only include sites that work without such redirects
 * later we can maybe make a loginpage -> proxypage array (so login.webofknowledge => webofknowledge)
 *
 * @type {Array}
 */
var urlsToProxy = urlsList;

/**
 * Determine the domain (which you can then check agains urls.min.js)
 */
function getDomain(url) {
	var doubleSlash = url.indexOf('//');
  	var unHttp = url.substr(doubleSlash + 2);
  	var domainSlash = unHttp.indexOf('/');
  	var domain = unHttp.substr(0, domainSlash);

  	return domain;
}



/**
 * function to see if the url can be proxied
 *
 * @param searchUrl
 * @param callback
 */
function getProxied(searchUrl, callback) {
  	var toProxy = '';

  	var doubleslash = searchUrl.indexOf('//');
  	var unhttp = searchUrl.substr(doubleslash + 2);
  	var domainslash = unhttp.indexOf('/');
  	var domain = unhttp.substr(0, domainslash);
 
  	if (domain.indexOf('.') === -1) {
    	return null;
  	}

  	var tldomain = domain.match(/[\w]+\.[\w]+$/)[0];

  	var parentDomain = domain.substr(domain.indexOf('.') + 1);

  	/**
   	 * Checks for bibe usage to see if user skipped the login button
   	 */

  	/**
   	* Check for PubMed special case
   	* If the searchUrl is for pubmed, but doesn't contain inluulib
   	* and if we haven't visited pubmed before in this session,
   	* then we need to redirect to a special url
   	*/
  	if (unhttp === 'www.ncbi.nlm.nih.gov/pubmed/' || unhttp === 'www.ncbi.nlm.nih.gov/pubmed') {
    	if ((unhttp.indexOf('inluulib') === -1) && (localStorage['pubmed'] != 'visited')) {
      	  saveStoragePubmed('new');
    	}
  	}

  	/**
   	* Save in storage
   	*/
    // Check if we are browsing a site via the proxy
  	saveStorageOnProxy(domain.indexOf('proxy.library.uu.nl') !== -1);

  	/*
   	 * Special cases, where we want to suggest an alternative site
   	*/
  	if (domain === 'www.lexisnexis.nl' || domain === 'www.vandale.nl' || domain === 'vandale.nl') {
    	//don't proxy, but suggest related site
    	saveStorageToProxy('no');
    	if (domain === 'www.lexisnexis.nl') {
      	  saveStorageRelated('http://academic.lexisnexis.nl');
    	}
    	if (domain === 'www.vandale.nl'  || domain === 'vandale.nl') {
      	  saveStorageRelated('http://uu.vandale.nl/zoeken/zoeken.do');
    	}
    	callback(toProxy);
  	}
  	else if (urlsToProxy.indexOf(domain) != -1 || urlsToProxy.indexOf(parentDomain) != -1 || urlsToProxy.indexOf('www.' + parentDomain) != -1) {
   	 	/*
     	* Special case WorldCat. WorldCat has urls with an institution name as the first part.
     	* We only want to proxy the one for the UU and the 'www' one, not the ones for other institutions
		* Change to your institutions name or remove this part
     	*/
    	if (domain.indexOf('worldcat') != -1) {
      	  	if (domain.indexOf('utrecht') === 0 || domain.substr(0, 3) == 'www') {
        		toProxy = 'yes';
        		saveStorageToProxy('yes');
        		callback(toProxy);
      	  	}
      		else {
        		toProxy = 'no';
        		saveStorageToProxy('no');
        		callback(toProxy);
      	   	}
    	}
    	else {
      		toProxy = 'yes';
      	  	saveStorageToProxy('yes');
      	  	callback(toProxy);
    	}
  }
  else if (localStorage['pubmed'] == 'new') {
    	saveStorageToProxy('yes');
    	callback(toProxy);
  }
  else {
    	toProxy = 'no';
    	saveStorageToProxy('no');
    	callback(toProxy);
  }
}


/**
 * Get IP of the user
 *
 * @returns {promise}
 */
function getIP() {
  	var ipRequest = $.ajax({url: 'http://api.ipify.org?format=json'});
  	return ipRequest;
}


/**
 * Check if the user's IP address falls within the campus range
 * 
 * @param ipFound
 * @param userPreferences
 * @returns {string}
 */
function checkIP(ipFound, userPreferences) {
  	var onCampus = 'no';
  	var ourDomain = 'xxx.xxx';
  	var ourRoamingStart = 'yyy.yyy';
 
  	//if matching on the first two parts is enough
  	if (ipFound.substring(0, 7) == ourDomain) {
    	onCampus = 'yes';
  	}
  	else if (ipFound.substring(0, 7) == ourRoamingStart) {
		//if you need a specific range   
    	//check the third bit of the IP; for example if your range is yyy.yyy.64.* to yyy.yyy.159.*
    	var lastDot = ipFound.lastIndexOf('.');
    	var toCheck = ipFound.substring(8, lastDot);
    	if (toCheck > 63 && toCheck < 160) {
      	  onCampus = 'yes';
    	}
  	}
  	else {
    	onCampus = 'no';
  	}

  	saveStorageOncampus(onCampus);
  	return onCampus;
}

/**
 * Initalize storage values
 *
 */

saveStoragePubmed(null);
function saveStorageQualify(value) {
  localStorage['qualify'] = value;
}
function saveStorageOncampus(value) {
  localStorage['oncampus'] = value;
}
function saveStorageToProxy(value) {
  localStorage['toproxy'] = value;
}
function saveStorageOnProxy(value) {
  localStorage['onproxy'] = (value == true) ? 'on' : 'off';
}
function saveStoragePubmedNew(value) {
  localStorage['pubmednew'] = value;
}
function saveStoragePubmedVisited(value) {
  localStorage['pubmedvisited'] = value;
}
function saveStoragePubmed(value) {
  localStorage['pubmed'] = value;
}
function saveStorageSearchEnginePage(value) {
  localStorage['bibe'] = value;
}
function saveStorageNotificationType(value) {
  localStorage['notetype'] = value;
}
function saveStorageRelated(value) {
  localStorage['related'] = value;
}
function getUserPreferences(callback) {
  chrome.storage.sync.get({
      showNotification: true,
      showSuggested: true
    },
    function (items) {
      callback(items);
    });
}
/**
 * Save the sites that the user has visited today.
 * We want to store the domain and the date
 *
 */
function saveVisited(visitedUrl) {
  var domain = getDomain(visitedUrl);

  var dateString = makeDateString();
  var domainsVisited = 'none';
  var visitedPlaces = [];
  if (localStorage['domainsvisited']) {
    domainsVisited = JSON.parse(localStorage['domainsvisited']);
    visitedPlaces = domainsVisited.visited;
  }
  visitedPlaces.push(domain);

  var toSave = {visited: visitedPlaces, on: dateString};
  localStorage['domainsvisited'] = JSON.stringify(toSave);
}
function findVisited(checkUrl) {
  var domain = getDomain(checkUrl);
  var dateString = makeDateString();

  var domainsVisited = 'none';
  if (localStorage['domainsvisited']) {
    domainsVisited = JSON.parse(localStorage['domainsvisited']);
    var visitedPlaces = domainsVisited.visited;
    var visitedDate = domainsVisited.on;
    if (visitedPlaces.indexOf(domain) !== -1 && visitedDate == dateString) {
      return 'yes';
    }
    else {
      return 'no';
    }
  }
  else {
    return 'no';
  }
}
function makeDateString() {
  var d = new Date();
  var year = d.getFullYear().toString();
  var month = (d.getMonth() + 1).toString();
  var day = d.getDate().toString();

  var dateString = year + month + day;
  return dateString;
}


/**
 * Remember user ip so we don't make a request every page change
 */
var ipFound;

/**
 * This is where the main logic happens
 * We depending on the user's IP address and the page's domain 
 * we determine whether we should change the extension icon, 
 * show a login button in the pop-up and, depending on the user's
 * preferences, an inpage notification
 * 
 * @param checkResult
 * @param url
 * @param tabId
 * @param userPreferences
 */
function checkRedirect(checkResult, url, tabId, userPreferences) {
  var verifyNetworkLocation = function (location) {
    ipFound = location.ip;
    var onCampus = checkIP(ipFound, userPreferences);

    //first see if this is a special case where we suggest a related site
    //if it isn't, go to the notifications logic
    if (localStorage['related'].length > 1 && localStorage['related'] !== 'null') {
      var relatedUrl = localStorage['related'];
      showRelated(relatedUrl, tabId, userPreferences);
    }
    else {
      /**
       * special case PubMed
       * if you are on campus, but typed in the URL (rather than going through bibe)
       * you will not see the UBUlink. So we want to redirect to the correct URL
       * even if you are on campus
       */
      if ((onCampus == 'no' && checkResult == 'yes') || (localStorage['pubmed'] == 'new')) {
        // Record a visit on a detected site
        ga('send', 'event', 'detected_site', getDomain(url), 'notifications ' + (userPreferences.showNotification ? 'on' : 'off'));

        //change to icon to "on"
        chrome.browserAction.setIcon({path: {"19": "images/19-go.png", "38": "images/38-go.png"}});

        //we want to make the login button visible in the icon popup
        //we can't send a message, because the popup may not be active
        //instead, let's try setting something in localstorage
        saveStorageQualify('yes');

        //check if the user has visited this site today
        var visited = findVisited(url);
        if (visited == 'no') {
          //save the fact that the user has visited this page
          saveVisited(url);
          saveStorageNotificationType('standard');
          //only show if user has checked "showNotification"
          if (userPreferences.showNotification) {
            chrome.tabs.executeScript(tabId, {
                code: 'var notetype="standard";'
              },
              function () {
                chrome.tabs.executeScript(tabId, {file: "js/content.js"}, function () {
                  ga('send', 'event', 'inpage_notification', 'shown', url);
                });
              });
          }
        }
        else {
          //if the user has visited this site today
          //and has notifications on
          //show mini-notification
           if (userPreferences.showNotification) {
              saveStorageNotificationType('mini');
                  chrome.tabs.executeScript(tabId, {
                      code: 'var notetype="mini";'
                  },
                  function () {
                      chrome.tabs.executeScript(tabId, {file: "js/content.js"}, function () {
                          ga('send', 'event', 'inpage_notification_mini', 'shown', url);
                      });
                  });
          	 }; //end of if shownotification
        } //end of "visitor has visited this site today"
      } //end of not on campus
      else if ((onCampus == 'yes' && localStorage['toproxy'] == 'yes') || (localStorage['onproxy'] == 'on')) {
        //if you are on campus or on the proxy, show a "green" icon
        chrome.browserAction.setIcon({path: {"19": "images/19-on.png", "38": "images/38-on.png"}});
      }
      else {
        saveStorageQualify('no');
        chrome.browserAction.setIcon({path: {"19": "images/19.png", "38": "images/38.png"}});
      }
    }//end of "is this a url for which we show a suggestion"
  };

  getIP().done(verifyNetworkLocation);
}

/**
 * For a few special cases, we show a suggestion for another page
 * You can use this for sites where your institution uses a specific subsite
 * that cannot be reached from the main start page
 *
 * @param relatedUrl
 * @param tabId
 * @param userPreferences
 */
function showRelated(relatedUrl, tabId, userPreferences) {
  if (userPreferences.showSuggested) {
    chrome.tabs.executeScript(tabId, {
        code: 'var notetype="site_suggestion";'
      },
      function () {
        chrome.tabs.executeScript(tabId, {file: "js/content.js"}, function () {
          ga('send', 'event', 'inpage_site_suggestion', 'shown', relatedUrl);
        });
      });
  }
}


/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    var tab = tabs[0];

    if (typeof(tab) === 'undefined') {
      return;
    }

    var url = tab.url;
    callback(url);

  });
}


/**
 * Start: do this whenever the browser requests a page
 *
 */
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {


  if (changeInfo.status === 'complete') {
    var url = tab.url;

    //start by setting all local storage variables to null
    saveStorageQualify(null);
    saveStorageOncampus(null);
    saveStorageToProxy(null);
    saveStorageOnProxy(null);
    saveStorageSearchEnginePage(null);
    saveStorageRelated(null);
    //if user has logged in to pubmed, leave that value as is
    if (localStorage['pubmed'] != 'visited') {
      saveStoragePubmed(null);
    }

    getProxied(url, function (checkResult) {
      getUserPreferences(function (userPreferences) {
        checkRedirect(checkResult, url, tabId, userPreferences);
      });
    });
  }
});


/**
 * Called when the user switches to the current tab
 */
chrome.tabs.onActivated.addListener(function (activeInfo) {
  // Set default icon for new tab
  chrome.browserAction.setIcon({path: {"19": "images/19.png", "38": "images/38.png"}});

  //start by setting all local storage variables to null
  saveStorageQualify(null);
  saveStorageOncampus(null);
  saveStorageToProxy(null);
  saveStorageOnProxy(null);
  saveStorageSearchEnginePage(null);
  saveStorageRelated(null);
  //if user has logged in to pubmed, leave that value as is
  if (localStorage['pubmed'] != 'visited') {
    saveStoragePubmed(null);
  }

  getCurrentTabUrl(function (url) {
    getProxied(url, function (checkResult) {
      getUserPreferences(function (userPreferences) {
        checkRedirect(checkResult, url, activeInfo.tabId, userPreferences);
      });
    });
  });
});

/**
 * function if user has clicked on "yes, log me in" button
 * The user is redirected to the the appropriate page, 
 * usually one where they can log in to gain access 
 */
chrome.notifications.onButtonClicked.addListener(function (ntId, btnIdx) {
  if (ntId == myNotificationID && btnIdx === 0) {

    ga('send', 'event', 'notification_loginbutton', 'clicked');

    //go to current tab, find that url and redirect
    getCurrentTabUrl(function (url) {
      var redirectUrl = getRedirectUrl(url);

      //special case: if the redirectUrl has inluulib in it (special case for pubmed),
      //remember that we saw it, to prevent further redirects
      if (redirectUrl.indexOf('inluulib') > -1) {
        saveStoragePubmed('visited');
      }

      chrome.tabs.update({url: redirectUrl});
    });
  }
});

/**
 * function on first install or update:
 * show a welcome or a "what's new" page
*/
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
  }
  else if (details.reason == "update") {
    /** based on user feedback, we only show this page if there is a substantial change */
	//chrome.tabs.create({url: "whatsnew.html"});
  }

});

