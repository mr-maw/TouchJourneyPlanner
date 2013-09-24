/* 
  Aalto Journey Planner configuration
  
  Copy this file as config.js and insert the correct configuration
  
  Following optional parameters are available for location items:
  
  "nomap": no marker on the map
  "start": default start point
  "end": default end poit
  
  Reittiopas account can be requested from:
  http://developer.reittiopas.fi/pages/en/account-request.php
 */

var config = {
  "api":"apiProxy/",
  "routeRefreshMinTime":2000, // milliseconds
  "longPressTime":500, // milliseconds
  "longPressThreshold":10, //pixels
  "locs": {
    "mapcenter": {
      "lat":60.181925,
      "lng":24.902101,
      "nomap":true
    }
  }
};