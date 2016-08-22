
/**
 *  @factory restService - functional that works with RESTful API of the server.
 *
 *  @param $resource - angular base service for rest requests
 *  @return object - custom resource
 */
angular.module('authProvider')
.factory("restService", function ($resource, localStorageService, AppConfig) {
        var token = {
            value: function () {
                return localStorageService.get('token');
            }
        }
        var resource = $resource(":action/:operation/:operation1/:operation2/:operation3/:operation4/",
            {
                action: "user",
                operation: '@operation',
                operation1: "",
                operation2: "",
                operation3: "",
                operation4: ""
            },
            {
                login: {
                    method: "POST",
                    url: AppConfig.serviceBasePath + AppConfig.authUrl,
                    isArray: false,
                    headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
                },
                logout: {
                    method: "GET",
                    isArray: false,
                    headers: {'X-CSRFToken': token.value}
                },
                get_districts: {
                    method: "GET",
                    isArray: true,
                    headers: {'X-CSRFToken': token.value}
                }
            });

        /**
         * @function loginUser - function generating request for user login
         * @param string userName - user name for login
         * @param string userPass - user password for login
         * @returns object - responsed object if 200 - {token = "<code>"}
         */
        resource.loginUser = function (userData) {
            return this.login({
                }, $.param(userData)
            ).$promise;
        };
        /**
         * @function logoutUser - function generating request for user logout
         */
        resource.logoutUser = function () {
            return this.logout({
                operation: "logout"
            });
        };
        resource.getDistrictList = function(dbName) {
            return this.get_districts({
                action: "api",
                operation: "v1",
                operation1:  "entity",
                operation2: dbName +".district_md"
            }).$promise;
        };

        return resource;
    });

NgApp.service('asyncService', function ($http, $q, $window) {
    return {
        loadDataFromUrls: function (requestData) {
            var deferred = $q.defer();
            var urlCalls = [];
            requestData.forEach(function (data) {
                urlCalls.push($http.jsonp(data.url, data.config));
            });
            $q.all(urlCalls)
                .then(
                function (results) {
                    deferred.resolve(results)
                },
                function (errors) {
                    deferred.reject(errors);
                },
                function (updates) {
                    deferred.update(updates);
                });
            return deferred.promise;
        }
    };
});

/**
 *  @service leaService - service for working with Leaflet Maps
 *
 *  @param $log - service for writing messages in console
 *  @return leaflet - leaflet object with custom functions
 */

NgApp.service('leaService', function($log, $rootScope, $filter) {
//config property for leaflet
    var leaConfig = {
        defaultLocations: [35, 105],
        defaultZoom: 3,
        geoConfig:{
            weight: 2,
            opacity: 1,
            color: '#b20241',
            steps: 100,
            dashArray: '5,5'
        },
        iconConfig: {
            className: "marker-icon",
            html:"",
            iconSize: [59, 50],
            iconAnchor: [18, 50],
            popupAnchor: [-1, -50]
        },
        tileLayerConfig: {
            maxZoom: 18
        },
        polyline: [],
        tilesUrl: 'public/img/tile/3_zh-cn/{x}/{y}.png' //mapbox http://{s}.tiles.mapbox.com/v3/swyat.jlnh75ij/{z}/{x}/{y}.png
    }

    var leaflet = L.map('map').setView(leaConfig.defaultLocations, leaConfig.defaultZoom);
    var leaGeo = null;

    /**
     * @function initMap - function for initialization leaflet and geo location module
     */
    leaflet.initMap = function() {

        L.tileLayer(leaConfig.tilesUrl, leaConfig.tileLayerConfig).addTo(leaflet);
        leaflet.touchZoom.disable();
        leaflet.doubleClickZoom.disable();
        leaflet.scrollWheelZoom.disable();
        leaflet.boxZoom.disable();
        leaflet.keyboard.disable();
        $(".leaflet-control-zoom").css("visibility", "hidden");
        leaflet.initLeaGeoModule();
    }

    /**
     * @function reInitMap - function for reinitialization leaflet
     */
    leaflet.reInitMap = function(currentLang) {
        leaConfig.tilesUrl = 'public/img/tile/3_'+ currentLang +'/{x}/{y}.png';
        L.tileLayer(leaConfig.tilesUrl, leaConfig.tileLayerConfig).addTo(leaflet);
    }

    /**
     * @function setMapPosition - function for setting leaflet map on position
     */
    leaflet.setMapPosition = function (coords) {
        leaflet.setView(coords, leaConfig.defaultZoom);
    }

    /**
     * @function initLeaGeoModule - function for initialization leaflet geo module
     */
    leaflet.initLeaGeoModule = function() {
        leaGeo = L.geodesic([], leaConfig.geoConfig).addTo(leaflet);
    }

    /**
     * @function addMarker - function for setting pointer on map
     *
     * @param markerCord obj - object with latitude and longitude coordinates
     * @param markerNumber {num} - number for viewing in marker
     */
    leaflet.addMarker = function(markerCord, complObj, markerNumber) {
        var domelem = document.createElement('div');
        var link = document.createElement('a');
        link.setAttribute("class", "region_link");
        link.innerHTML = "<br>"+ $filter('translate')('Click to view') +"<br>"
                        + $filter('translate')('region map')+"</a>";

        domelem.innerHTML = "<b class='region_town'>"+ complObj.name +"</b>";
        domelem.appendChild(link);
        link.onclick = function(e) {
            if ($rootScope.activeMap) $rootScope.openAirportsPopup(complObj, markerNumber);
        };
        leaConfig.iconConfig.html = angular.isDefined(markerNumber)
                                        ? "<span class='marker_number'>"+ markerNumber +"</span>" : "";
        var customIcon = L.divIcon(leaConfig.iconConfig);

        var markerObj = L.marker(markerCord, {icon: customIcon, 'zIndexOffset': -181}).addTo(leaflet).bindPopup(domelem);
        markerObj.off('click');
        markerObj.on('click', function(e) {
            if ($rootScope.activeMap) markerObj.openPopup();
        })
        leaflet.setMapPosition(markerCord);
        return markerObj;
    }

    /**
     * @function drawGeodesicLine - function for drawing geo line
     *
     * @param firstMarkerCord obj - object with latitude and longitude first point coordinates
     * @param secondMarkerCord obj - object with latitude and longitude second point coordinates
     *
     * @return object - current line object
     */
    leaflet.drawGeodesicLine = function(firstMarkerCord, secondMarkerCord) {
        var polyline = new L.Polyline([firstMarkerCord, secondMarkerCord], leaConfig.geoConfig);
        leaConfig.polyline = polyline;
        leaflet.addLayer(polyline);
        return true;
    }

    /**
     * @function removePoint - function for removing point
     *
     * @param pointObj obj - object of point for removing
     */
    leaflet.removePoint = function(pointObj) {
        if (angular.isUndefined(pointObj)) {
            pointObj = leaConfig.polyline;
        }
        leaflet.removeLayer(pointObj);
    }

    return leaflet;
});