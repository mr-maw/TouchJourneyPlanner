$(document).ready(function() {
    if(!window.console) {
        window.console = function(){};
        console.log = function(){};
        console.debug = function(){};
    }
    
    /*console.log("Hello World from app.js");*/

    initializeMap();
    initializeTimeSelector();

    var map,
        startMarker,
        endMarker,
        otherMarkers,
        polyline,
        legLinesAndMarkers;

    function initializeTimeSelector() {
        setTimeNow();
        
        $('#time').on('change', function(){
            console.log("time changed");
            if (endMarker) {
                getRoute();
            }
        });
    }

    function setTimeNow() {
        var now = new Date();
        $('#time').val(now.getHours()+':'+now.getMinutes());
    }

    function initializeMap() {
        var c = config.locs.mapcenter;
        var latlng = new google.maps.LatLng(c.lat, c.lng);

        var customMapType = new google.maps.StyledMapType([{
            stylers: [{
                gamma: 0.6
            }]
        }, {
            featureType: "road.highway",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }, {
            featureType: "water",
            stylers: [{
                lightness: -10
            }]
        }, {
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }], {
            name: "Custom"
        });

        var myOptions = {
            zoom: 12,
            center: latlng,
            streetViewControl: false,
            mapTypeControl: false,
            rotateControl: false,
            panControl: false,
            zoomControlOptions: {
                position: google.maps.ControlPosition.BOTTOM_LEFT,
                style: google.maps.ZoomControlStyle.SMALL
            },
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, 'custom']
            }
        };
        map = new google.maps.Map(document.getElementById("map_canvas"),
        myOptions);

        map.mapTypes.set('custom', customMapType);
        map.setMapTypeId('custom');

        var startDefaultLatLng = new google.maps.LatLng(60.1807374, 24.9413685),
            endDefaultLatLng = null;

        // Get start and end from config, if available
        $.each(config.locs, function(i, loc) {
            if ("start" in loc) {
                startDefaultLatLng = new google.maps.LatLng(loc.lat, loc.lng);
            }
            else if ("end" in loc) {
                endDefaultLatLng = new google.maps.LatLng(loc.lat, loc.lng);
            }
        });
        
        
        var startIcon = new google.maps.MarkerImage("images/your-position-small.png", null, null, new google.maps.Point(10, 10));
        
        if (navigator.geolocation) {
            //console.log("geolocation");
            navigator.geolocation.getCurrentPosition(function(position) {
                handleGeolocation(position);
            }, function() {
                handleNoGeolocation();
            });
        }
        
        function handleGeolocation(position) {
            startDefaultLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            startMarker = new google.maps.Marker({
                position: startDefaultLatLng,
                draggable: false,
                title: "Start",
                icon: startIcon
            });
            startMarker.setMap(map);
            map.setCenter(startDefaultLatLng);
            //console.log("geolocation set");
        }
        
        function handleNoGeolocation() {
            alert("Geolocation service failed.");
            startMarker = new google.maps.Marker({
                position: startDefaultLatLng,
                draggable: false,
                title: "Start",
                icon: startIcon
            });
            startMarker.setMap(map);
            map.setCenter(startDefaultLatLng);
            
        }


        
        
        //google.maps.event.addListener(startMarker, 'mouseup', getRoute);

        if (endDefaultLatLng) {
            routeTo(endDefaultLatLng);
        }

        otherMarkers = [];
        $.each(config.locs, function(i, loc) {
            if (!("nomap" in loc)) {
                //console.log('other location:' + config.locs[i].title);
                var latLng = new google.maps.LatLng(loc.lat, loc.lng);

                //old icon: "https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|ffffff|9|b|"+loc.title
                var icon = "https://chart.googleapis.com/chart?chst=d_simple_text_icon_below&chld=" + loc.title + "|14|fff|" + "star|24|ffff00|333";

                var marker = new google.maps.Marker({
                    position: latLng,
                    draggable: false,
                    title: loc.title,
                    zIndex: 0,
                    icon: icon
                });
                marker.setMap(map);
                google.maps.event.addListener(marker, 'mouseup',

                function() {
                    routeTo(latLng);
                });

                otherMarkers.push(marker);
            }
        });

        legLinesAndMarkers = [];

        var LongClick = function(map, length) {
            this._length = length;
            var me = this;
            me._map = map;
            google.maps.event.addListener(map, 'mousedown', function(e) {
                me._onMouseDown(e);
            });
            google.maps.event.addListener(map, 'mouseup', function(e) {
                //console.log(e);
                me._onMouseUp(e);
            });
        };
        LongClick.prototype._onMouseUp = function(e) {
            var now = new Date();
            if (now - this._down > this._length) {
                if (Math.abs(e.pixel.x - this._x) < config.longPressThreshold && Math.abs(e.pixel.y - this._y) < config.longPressThreshold) {
                    google.maps.event.trigger(this._map, 'longpress', e);
                }
            }
        };
        LongClick.prototype._onMouseDown = function(e) {
            this._down = new Date();
            this._x = e.pixel.x;
            this._y = e.pixel.y;
        };
        var longClick = new LongClick(map, config.longPressTime);
        google.maps.event.addListener(map, 'longpress', function(e) {
            routeTo(e.latLng);
        });
        google.maps.event.addListener(map, 'rightclick', function(e) {
            routeTo(e.latLng);
        });
    }

    
    function routeTo(latLng) {
        if (!endMarker) addEndMarker(latLng);
        
        endMarker.setPosition(latLng);
        getRoute();
        lastRouteMillis = new Date().valueOf();
    }

    function addEndMarker(latLng) {
        var endIcon = new google.maps.MarkerImage("images/goal.png", null, null, new google.maps.Point(17, 52));
        endMarker = new google.maps.Marker({
            position: latLng,
            draggable: true,
            icon: endIcon
        });
        endMarker.setMap(map);
        google.maps.event.addListener(endMarker, 'mouseup', getRoute);
    }

    function initializeSwitches() {
        var switches = $('<div id="map_switches"></div>');
        switches.append('<a id="switch-toggle-other-markers" href="javascript:;">' + 'Campus markers</a>');
        /*switches.append('<a id="switch-toggle-your-position" href="javascript:;">'
        +'Your position</a>');*/
        $("#map_canvas").append(switches);
        $("#switch-toggle-other-markers").click(function() {
            var isOff = $(this).hasClass("off");
            $.each(otherMarkers, function(i, marker) {
                marker.setVisible(isOff);
                if (isOff) {
                    $("#switch-toggle-other-markers").removeClass("off");
                }
                else {
                    $("#switch-toggle-other-markers").addClass("off");
                }
            });
        });
        /*$("#switch-toggle-your-position").click(function(){
      var isOff = $(this).hasClass("off");
      startMarker.setVisible(isOff);
      if(isOff) {
        $("#switch-toggle-your-position").removeClass("off");
      } else {
        $("#switch-toggle-your-position").addClass("off");
      }
    });*/
    }

    function getTransportHex(type, variant) {
        var color = "";
        switch (type) {
        case "walk":
            color = "499bff";
            if (variant === "light") color = "8dd2ff";
            break;
        case "tram":
            color = "00ae2e";
            if (variant === "light") color = "5ee764";
            break;
        case "metro":
            color = "fb6500";
            if (variant === "light") color = "ff9c42";
            break;
        case "ferry":
            color = "00aee7";
            if (variant === "light") color = "69e6ff";
            break;
        case "train":
            color = "e9001a";
            if (variant === "light") color = "ff7d61";
            break;
        case "bus":
            color = "193695";
            if (variant === "light") color = "5a65cc";
            break;
        // bus
        default:
            color = "193695";
            if (variant === "light") color = "5a65cc";
            break;
        }

        return color;
    }

    function getIconType(type) {
        switch (type) {
        case "tram":
            return "train";
        case "metro":
            return "train";
        case "ferry":
            return "ship";
        case "walk":
            return "glyphish_walk";
        default:
            return type;
        }
    }

    function createPolyline(path, transportTypeString) {
        if (!path) {
            path = [];
            console.log("No path!");
        }

        var color = "#" + getTransportHex(transportTypeString);

        polyline = new google.maps.Polyline({
            path: path,
            strokeColor: color,
            strokeWeight: 4,
            clickable: false
        });
        polyline.setMap(map);

        return polyline;
    }
    
    var geocoder = new google.maps.Geocoder();

    function geocodePosition(pos, callback) {
        geocoder.geocode({
            latLng: pos
        }, function(responses) {
            if (responses && responses.length > 0) {
                var response = responses[0];
                console.log(response);
                var responseStr = response.address_components[1].long_name 
                    + " " + response.address_components[0].long_name;
                callback(responseStr);
                return true;
            }
            else {
                return false;
            }
        });
    }
    
    function createMarker(LatLng, vehicle, type) {
        var color = getTransportHex(type);
        var icontype = getIconType(type);

        //old icon: "https://chart.googleapis.com/chart?chst=d_map_spin&chld=1|0|"+color+"|11|b|"+vehicle

        var marker = new google.maps.Marker({
            position: LatLng,
            draggable: false,
            title: vehicle + "",
            icon: "https://chart.googleapis.com/chart?chst=d_simple_text_icon_below&chld=" 
            + vehicle + "|16|fff|" + icontype + "|16|" + color + "|333"
        });
        marker.setMap(map);
        return marker;
    }

    function showRoute(legs) {
        // remove any current lines
        for (var i in legLinesAndMarkers) {
            var p = legLinesAndMarkers[i].polyline;
            p.setMap(null);
            p.latLngs = null;
            if (legLinesAndMarkers[i].marker) {
                var m = legLinesAndMarkers[i].marker;
                m.setMap(null);
                m.setIcon(null);
                m.setPosition(null);
            }
            legLinesAndMarkers[i] = null;
        }
        legLinesAndMarkers = [];

        for (i in legs) {
            var leg = legs[i];
            var type = getLegTypeString(leg.type);
            var marker = null;
            if (type !== "walk") {
                var markerText = formatVehicleCode(leg.code, type);
                marker = createMarker(
                    new google.maps.LatLng(leg.locs[0].coord.y, leg.locs[0].coord.x), 
                    markerText, 
                    type
                    );
            }
            var path = [];
            for(var j in leg.locs) {
                var loc = leg.locs[j];
                path.push(new google.maps.LatLng(loc.coord.y, loc.coord.x))
            }
            var line = createPolyline(path, type);
            path = null;
            legLinesAndMarkers.push({
                polyline: line,
                marker: marker
            });
        }
    }

    function formatVehicleCode(code, type) {
        var vehicleString = "";
        if (type === "train") {
            vehicleString = code.substring(4, 5);
        }
        else if (type === "metro") {
            vehicleString = "";
        }
        else {
            vehicleString = code.substring(1, 6).trim();
            var leadingZeros = 0;
            for (var i in vehicleString) {
                if (vehicleString[i] === "0") {
                    leadingZeros++;
                }
                else {
                    break;
                }
            }
            vehicleString = vehicleString.substring(leadingZeros);
        }

        return vehicleString;
    }

    var lastRouteMillis = 0;
    
    function getRoute() {
        if (lastRouteMillis + config.routeRefreshMinTime < new Date().valueOf()) {
            
            //console.log("getRoute");
    
            if (!startMarker || !endMarker) {
                return false;
            }
    
            $("#loader").fadeIn();
            if ($("#results").not(":visible"))
                $("#results").show();
    
            // Clear current data
            $(".result")
                .off('click') // event listener
                .fadeOut('fast',
                    function(){
                        $(this)
                            .removeClass('selected')
                            .html(''); // HTML    
                    });
            showRoute({});
    
            var fromLatLng = startMarker.getPosition();
            var from = fromLatLng.lng() + "," + fromLatLng.lat();
    
            var toLatLng = endMarker.getPosition();
            var to = toLatLng.lng() + "," + toLatLng.lat();
    
            var time = $("#time").val().replace(":", "");
    
            var params = "?request=route&from=" + from + "&to=" + to + "&time=" 
                + time + "&format=json&epsg_in=wgs84&epsg_out=wgs84";
            var account = "&user=" + config.user + "&pass=" + config.pass;
    
            $.getJSON(config.api + params + account, function(data) {
                $("#loader").fadeOut();
                //console.log(data);
                if (data && data[0]) {
                    var resultSet = $(".result");
                    $.each(resultSet, function(i, val){
                        var route = data[i][0];
                        var routePath = [];
                        
                        //console.log(route);
                        var result = resultSet.eq(i);
                        
                        //result.append($("<div class='number'>" + (i + 1) + "</div>"));
                        var startTime = route.legs[0].locs[0].depTime;
                        var endTime = route.legs[route.legs.length - 1].locs[route.legs[route.legs.length - 1].locs.length - 1].arrTime;
                        var firstVehicle = "walk";
                        var longestLeg = 0;
                        if (route.legs.length > 1) {
                            longestLeg = route.legs[1].length;
                            var type = getLegTypeString(route.legs[1].type);
                            firstVehicle = 
                                type + " " + formatVehicleCode(route.legs[1].code, type);
                        }
                        result.append(
                                $("<h1>"
                                + startTime.substr(8, 2) + ":" + startTime.substr(10, 2) + " "
                                + "<span class='vehicle'>" + firstVehicle + "</span> "
                                + "(" + route.duration / 60 + " mins)" 
                                + "</h1>")
                            );
                        
                        var legs = $("<ol></ol>").appendTo(result);
                        //console.log(route);
                        route.legs.forEach(function(leg, n, array) {
                            
                            var legItem = $("<li></li>").appendTo(legs);
                            
                            var time = leg.locs[0].depTime;
                            legItem.append("<span class='time'>" + time.substr(8, 2) + ":" + time.substr(10, 2) + "</span> ");
                            
                            var type = getLegTypeString(leg.type);
                            legItem.append("<span class='type'>" + type + "</span> ");
                            
                            if (type === "walk") {
                                legItem.append("<span class='meters'>" + leg.length + " m</span>");
                            }
                            else {
                                var vehicleCode = formatVehicleCode(leg.code, type);
                                if (leg.length > longestLeg) {
                                    longestLeg = leg.length;
                                    var curType = getLegTypeString(leg.type);
                                    var curVehicle = 
                                        curType + " " + formatVehicleCode(leg.code, curType);
                                    result.find(".vehicle").text(curVehicle);
                                }
                                legItem.append("<span class='type'>" + vehicleCode + "</span> ");
                            
                            }
                            var startEndString = "<span class='places'>";
                            startEndString += "&rsaquo; ";
                            if (leg.locs[leg.locs.length - 1].name) startEndString += leg.locs[leg.locs.length - 1].name;
                            startEndString += "</span>";
                            if (n === route.legs.length - 1) {
                                var lastLoc = leg.locs[leg.locs.length - 1];
                                var lastPos = new google.maps.LatLng(lastLoc.coord.y, lastLoc.coord.x);
                                geocodePosition(lastPos, function(response) { 
                                    legItem.find(".places").html("&rsaquo; "+response);
                                });
                            }
                        
                            legItem.append(startEndString);
                            
                            
                            leg.locs.forEach(function(loc, i, array) {
                                routePath.push(new google.maps.LatLng(loc.coord.y, loc.coord.x));
                            });
                        });
                        
                        result.show();
                        
                        // Show route on map when clicked
                        result.on('click',function() {
                            showRoute(route.legs);
                            $(".result")
                                .removeClass("selected")
                                .find("ol")
                                .slideUp("fast");
                            $(this)
                                .addClass("selected")
                                .find("ol")
                                .slideDown("fast");
                        });
                        
                        // Show the first result immediately
                        if (i === 0) {
                            showRoute(route.legs);
                            result
                                .addClass("selected")
                                .find("ol")
                                .slideDown("fast");
                        }
                    });
                }
                else {
                    $(".result")
                        .first()
                        .html("<h1>No routes!</h1>")
                        .slideDown('fast');
                }
            });
        } else {
            //console.log("< 2000 ms, skipping routing");
        }
    }

    function getLegTypeString(typeId) {
        switch (typeId) {
        case "walk":
            return "walk";
        case "2":
            return "tram";
        case "6":
            return "metro";
        case "7":
            return "ferry";
        case "12":
            return "train";
        default:
            return "bus";
        }
    }

});