/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 */

/**
 * Show the relevant text and buttons on the page
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
		 	document.getElementById("note_loginbutton").classList.add("button-green");
         	document.getElementById("note_loginbutton").removeAttribute('disabled');

         	getCurrentTabUrl(function (url) {
         	   document.getElementById("note_loginbutton").href = getRedirectUrl(url);
        	});
      	}
      	else {
			document.getElementById("note_loginbutton").style.display = "none";
      	}
    }

    /*
     * Special case PubMed.
     * Show this extra button only if user is on campus; else they will get the normal
     * login button, which has the same effect
     */
  	if (onPubmed == 'new' && onCampus == 'yes') {
  		  document.getElementById('pubmed').style.display = "block";
          document.getElementById("note_loginbutton_pubmed").classList.add("button-green");
          document.getElementById("note_loginbutton_pubmed").removeAttribute('disabled');

          getCurrentTabUrl(function (url) {
            	document.getElementById("note_loginbutton_pubmed").href = getRedirectUrl(url);
          });
   	}
  	else {
  		document.getElementById('pubmed').style.display = "none";
  	}

});

/**
 * Listen to the login button
 */
document.getElementById("note_loginbutton").addEventListener("click", function () {
  	getCurrentTabUrl(function (url) {
  		ga('send', 'event', 'note_inpage_loginbutton', 'clicked', 'url', url);
  	});

  	var redirectUrl = document.getElementById("note_loginbutton").href;

  	//if the redirectUrl is for PubMed, store the fact that we have visited PubMed
  	if (redirectUrl.indexOf('pubmed') > -1 ) {
  		saveStoragePubmed('visited');
  	}
   	chrome.runtime.sendMessage({demand: "redirect", text: redirectUrl});
});

/**
 * Listen to the special PubMed login button
 */
document.getElementById("note_loginbutton_pubmed").addEventListener("click", function () {
  	ga('send', 'event', 'note_inpage_loginbutton_pubmed', 'clicked');
  	saveStoragePubmed('visited');

  	var redirectUrl = document.getElementById("note_loginbutton_pubmed").href;
  	chrome.runtime.sendMessage({demand: "redirect", text: redirectUrl});
});



