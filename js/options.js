/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 */

// Google Analytics
var ga = chrome.extension.getBackgroundPage().ga;
ga('send', 'pageview', 'options.html');

/**
 * Save options
 */
function save_options() {
  	var doNotification = document.getElementById('notification').checked;
  	var doSuggestions = document.getElementById('suggestions').checked;
  
  	ga('send', 'event', 'options', (doNotification ? 'notification-on' : 'notification-off'));
  	ga('send', 'event', 'options', (doSuggestions ? 'suggestions-on' : 'suggestions-off'));
  
  	chrome.storage.sync.set({
      	showNotification: doNotification,
	  	showSuggested: doSuggestions
    },
    function () {
      	//update status to let user know the options were saved
      	var status = document.getElementById('status');
      	status.innerHTML = '<div class="pure-alert pure-alert-success">Options saved</div>';
      	setTimeout(function () {
        status.innerHTML = '';
      }, 750);
    });
}

/**
 * Show checkbox state using stored preferences
 */
function restore_options() {
  //use default true for both checkboxes
  chrome.storage.sync.get({
      showNotification: true,
	  showSuggested: true
    },
    function (items) {
      document.getElementById('notification').checked = items.showNotification;
	  document.getElementById('suggestions').checked = items.showSuggested;
    });
}

/**
 * send score as an event to Googe Analytics
 */
function save_score() {
	for (var i = 1; i <= 10; i++) {
    	var id = 'nps' + i;
    	if (document.getElementById(id).checked) {
      	  	ga('send', 'event', 'nps', 'scored', i, i);
    	}
  	}

  	chrome.storage.sync.set({
      	npsrecorded: 1
    },
    function () {
      	//update status to let user know the options were saved
      	var status = document.getElementById('nps-saved');
      	status.innerHTML = '<div class="pure-alert pure-alert-success">Thank you for your rating</div>';
      	setTimeout(function () {
        	$('#nps-info').hide();
      	}, 1550);
    });
}

/**
 * Load stored preferences on start
 */ 
document.addEventListener('DOMContentLoaded', restore_options);

/**
 * Listen to the 'save' button
 */
document.getElementById('save').addEventListener('click', save_options);

/**
 * Start
 */
$(document).ready(function () {
	chrome.storage.sync.get({
      npsrecorded: 0
    },
    function (items) {
      var display = items.npsrecorded === 1 ? 'none' : 'block';
      $('#nps-info').css('display', display);
    });
});