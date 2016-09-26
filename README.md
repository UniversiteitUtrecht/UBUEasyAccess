# UBUEasyAccess

================ start
To make this extension work for your institute, you will need to add four pieces of information

1. Your institute's IP range, as used for access to licensed material
Add this in js/eventPage.js, in the checkIP function

2. A list of domains for which you want to use this extension
Edit js/urls.js to reflect your licenses. Then minify it for faster reading (this will be url.min.js)

3. The URL of the page where your users can log in
In js/eventPage.js and js/notification.js, edit the proxy variable (in the function getRedirectUrl)

4. The Google Analytics profile ID you want to use to track usage
Add this in js/eventPage.js, js/notification.js and js/popup.js. 
 

You will probably also want to replace the icons in the images directory.

================ end
