Helsinki area public transit journey planner for touch environments.

Description
-----------

Touch Journey Planner is a HTML5 application, which brings public transport journey planning to multitouch environments. 
The application is a mashup service that uses Google Maps API, HSL's Journey Planner API and Google Infographics API 
to create an alternative user interface for the Journey Planner. All code is standards-compliant, so the application 
works on many touchscreen devices as it is.

The application has been designed to be fast and intuitive to use on a multitouch display. In particular, there are 
no text input fields. All interaction relies on touch gestures and taps, and to streamline the user experience, 
the start position is preset so only the destination needs to be set by the user. This is reasonable 
considering the application is meant to be used on stationary Aalto Window touch tables. 

The application consists of a barebone HTML-file (index.html), a stylesheet (common.css) and two Javascript files 
(config.js and app.js). Config.js is the application's configuration file. It includes Journey Planner API 
credentials and all the default locations: map center, start, end and favorites. Only the map center and start 
locations are required, others are optional. If the end location is set, the application will calculate routes as 
it starts up. Otherwise the destination needs to be set by the user before any routes are displayed.


Installation instructions:
--------------------------

1. Request Reittiopas API account from http://developer.reittiopas.fi/pages/en/account-request.php
2. Rename config.js.template to config.js and add account details
3. Install Node.js and run ```npm install```


Running on a multitouch table with Google Chrome:
-------------------------------------------------

Add following startup parameters to the chrome application

1) Enable touch events 

    --enable-touch-events 

2) Switch user agent to iOS to get the right version of Google Maps JS API

    --user-agent="Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10"


Used libraries
--------------

* JQuery 1.7
* Mobiscroll 1.5.2
* Google Maps API