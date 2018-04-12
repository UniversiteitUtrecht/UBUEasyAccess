/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 * Functions shared by both types of notification
 */


/**
 * Build the redirect URL
 *
 * @param url
 * @returns {string}
 */
var getRedirectUrl = function (url) {
  	//The URL to the relevant login page. The one for the Utrecht University proxy is shown below as an example
	var proxy = "https://login.proxy.library.uu.nl/login?utm_source=ezxs&qurl=";
  
  	/**
   	* Special cases
   	*/
  	//if scholar.google add /ncr to the redirecturl, to prevent country redirects
  	if (url.indexOf("scholar") == 0) {
    	url = url + 'ncr';
  	}

  	//If Pubmed use a specific url
  	if (url.indexOf('pubmed') > -1 || url.indexOf('www.ncbi.nlm.nih.gov') > -1) {
    	url= 'http://www.ncbi.nlm.nih.gov/pubmed?otool=inluulib' ;
  	}
  
  	//off campus access to WebOfKnowledge will send you to a login page that can't be proxied
  	//so redirect to proxied start page
  	if (url.indexOf('login.webofknowledge.com') > -1) {
  		url = 'http://apps.webofknowledge.com';
  	}
  	return proxy + encodeURIComponent(url);
};

/**
 * Google Analytics
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


ga('create', '[your profile id]', 'auto');
ga('set', 'anonymizeIp', true);
ga('set', 'checkProtocolTask', null); //to make it work with extension, rather than http
ga('send', 'pageview', 'notification.html');


/**
 * Get the current Url
 */
function getCurrentTabUrl(callback) {
	var url = window.location.search;
	var use_url = url.substr(1);
	callback(use_url);
}

/**
 * Save if we are on a PubMed page
 */
function saveStoragePubmed(value) {
	localStorage['pubmed'] = value;
}


