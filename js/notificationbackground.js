/**
 * EZSX notification
 * Made by Marina Muilwijk for Utrecht University Library
 *
 * This listens to events on the notification pages and sends them to the event page
 */
chrome.runtime.onMessage.addListener(function(message, sender){
	chrome.tabs.sendMessage(sender.tab.id, message);
});

