/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 */

/**
 * Show the relevant parts of the notification
 */
document.addEventListener('DOMContentLoaded', function () {
	var qualify = localStorage['qualify'],
    	onCampus = localStorage['oncampus'],
    	toProxy = localStorage['toproxy'],
    	onProxy = localStorage['onproxy'],
		onPubmed = localStorage['pubmed'],
		noteType = localStorage['notetype'];


    if (onProxy == 'on') {
      	$('#proxy').hide();
    } 
	else {
      	if (toProxy == "yes" && qualify == "yes") {
			document.getElementById('proxy').style.display = "block";
      	} 
	  	else {
			document.getElementById('proxy').style.display = "none";
      	}

     	if (qualify == 'yes' && onCampus == 'no') {
       		document.getElementById("small_note_loginbutton").style.display = "block";
       	   	getCurrentTabUrl(function (url) {
         	   document.getElementById("small_note_loginbutton").href = getRedirectUrl(url);
       		});
      	}
      	else {
			document.getElementById("smallnote_loginbutton").style.display = "none";
      	}
    }
  
    /*
     * Special case PubMed. 
     * Show this extra button only if user is on campus; else they will get the normal
     * login button, which has the same effect
     */
  	if (onPubmed == 'new' && onCampus == 'yes') {
   		document.getElementById("small_note_loginbutton_pubmed").style.display = "block";
   	    getCurrentTabUrl(function (url) {
     	   document.getElementById("small_note_loginbutton_pubmed").href = getRedirectUrl(url);
   		});
    }
  	else {
  		document.getElementById('pubmed').style.display = "none";
  	}
});

/**
 * Listen to the login button
 */
document.getElementById("small_note_loginbutton").addEventListener("click", function () {
  	getCurrentTabUrl(function (url) {
  		ga('send', 'event', 'note_inpage_mini_loginbutton', 'clicked', 'url', url);
	});

  	var redirectUrl = document.getElementById("small_note_loginbutton").href;
  
  	//if the redirectUrl is for PubMed, store the fact that we have visited PubMed
  	if (redirectUrl.indexOf('pubmed') > -1 ) {
  		saveStoragePubmed('visited');
  	}
   	chrome.runtime.sendMessage({demand: "redirect", text: redirectUrl});
});

/**
 * Listen to the special PubMed button
 */
document.getElementById("small_note_loginbutton_pubmed").addEventListener("click", function () {
  	ga('send', 'event', 'note_inpage_mini_loginbutton_pubmed', 'clicked');
  	saveStoragePubmed('visited');

  	var redirectUrl = document.getElementById("small_note_loginbutton_pubmed").href;
  	chrome.runtime.sendMessage({demand: "redirect", text: redirectUrl});
});

