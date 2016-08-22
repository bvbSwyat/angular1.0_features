/**
 * Created by swyat on 9/10/14.
 */

/**
 * @filter searchPeriod - function for formatting data like - "14 Nov" OR "14-28 Nov'
 * @param $filter - inner formatting service
 */
NgApp.filter("searchPeriod", function($filter) {
    return function(input, startTime, endTime) {
        if (angular.isDefined(endTime) && endTime != "") {
            var startMonth = ($filter('date')(startTime, 'M') != $filter('date')(endTime, 'M'))
                ? " "+ $filter('translate')($filter('date')(startTime, 'MMM'))
                : "";
            return $filter('date')(startTime, 'd')
                + startMonth
                + "-"
                + $filter('date')(endTime, 'd ')
                + $filter('translate')($filter('date')(endTime, 'MMM'));
        }
        return $filter('date')(startTime, 'd ')+$filter('translate')($filter('date')(startTime, 'MMM'));
    };
});

/**
 * @filter dateParser - filter to parse date to custom format
 * @param $filter - filter pattern
 * @param date - time in format "2014-10-29T11:11:27.000+00"
 */
NgApp.filter('dateParser', function($filter, $rootScope) {
    return function(date, dateFormat) {
        if (angular.isDefined(date)) {
            var format;
            var anotherFormatIndex = date.lastIndexOf('.000+00');
            if (anotherFormatIndex != -1) {
                date = date.substring(0, anotherFormatIndex) + "+00:00";
            }
            (angular.isDefined(dateFormat)) ? format = dateFormat : format = "yyyy-MM-dd";
            var date = new Date(date).getTime();
            var timeOffset = new Date().getTimezoneOffset() * 60000;
            return $filter('date')(date + timeOffset, format);
        }
    }
});

/**
 * @filter timeParser - filter to parse time in minutes to format - "00 h 00 min"
 * @param $rootScope - scope pattern
 * @param $filter - filter pattern
 */
NgApp.filter('timeParser', function($rootScope, $filter) {
    return function(time) {
        var timeObj = {h: 0, m: 0};
        if (time != false) {
            timeObj = {
                h: time[0] == 0 ? time[1] : time.substr(0, 2),
                m: time[2] == 0 ? time[3] : time.substr(2)
            };
        }
        return timeObj.h + ' '+ $filter('translate')('h') +' ' + timeObj.m + ' ' + $filter('translate')('min');
    }
})

/**
 * @filter stopPlaceFilter - filter for change fly type - 'direct' -> 'via airport1, airport2'
 * @param $rootScope - scope pattern
 * @param $filter - filter pattern
 */
NgApp.filter('stopPlaceFilter', function ($rootScope, $filter) {
    return function (item, flightsObj, withoutVia) {
        var stopPlaceName = $filter('translate')('direct');
        if (flightsObj.length > 1) {
            stopPlaceName = angular.isDefined(withoutVia)  ? "" : $filter('translate')('via ');
            $.map(flightsObj, function(flight, key) {
                if (flightsObj.length-1 > key) {
                    var coma = (flightsObj.length-1 > 1 && stopPlaceName == $filter('translate')('via ')) ? ", " : "";
                    stopPlaceName = stopPlaceName + flight.to.city_name + coma;
                }
            });
        }
        return stopPlaceName;
    }
});

/**
 * @filter stopTimeFilter - filter for change fly type - 'direct' -> 'via city1, city2'
 * @param $rootScope - scope pattern
 */
NgApp.filter('stopTimeFilter', function ($rootScope) {
    return function (item, flightsObj) {
        var countFlights = flightsObj.length;
        if (countFlights > 1) {
            var lastFlight = flightsObj[countFlights - 1];
            var timeObj = $rootScope.parseMinutes(lastFlight.stop_time);
            return timeObj.h + ' h ' + timeObj.m + ' min';
        }
        return;
    }
});

/**
 * @filter getMinPriceFilter - filter for searching and viewing min ticket price
 * @param $rootScope - scope pattern
 */
NgApp.filter('getMinPriceFilter', function ($rootScope) {
    return function (currency, priceArray) {
        if (priceArray.length == 0) {
            return;
        }
        var minPrice = Math.min.apply(this, priceArray);
        var countMaches = $rootScope.getCountMatches(minPrice, priceArray);
        if(countMaches > 1 && minPrice.length-1 != countMaches) {
           return minPrice;
        }
        if (minPrice.length != 0 && priceArray.length > 1) {
            return minPrice;
        }
        return minPrice;
    }
});

/**
 * @filter diffTravelTime - filter to parse time in minutes to format - "00 hour(s) 00 minute(s)"
 * @param $rootScope - scope pattern
 * @param $filter - filter pattern
 */
NgApp.filter('diffTravelTime', function($rootScope, $filter) {
    return function(time) {
        var timeObj = {h: 0, m: 0};
        if (time != false) {
            timeObj = {
                h: time[0] == 0 ? time[1] : time.substr(0, 2),
                m: time[2] == 0 ? time[3] : time.substr(2)
            };
        }

        var titleHour = $filter('translate')(timeObj.h > 1 ? "hours" : "hour");
        var titleMinute = $filter('translate')((timeObj.m == 1) ? "minute" : "minutes");
        var time = timeObj.h > 0
            ? timeObj.h + " " + titleHour + " " + timeObj.m % 60 + " " + titleMinute
            : timeObj.m % 60 + " " + $filter('translate')("minutes");
        return time;
    }
});

/**
 * @filter diffTravelTime - filter to parse time in minutes to format - "00 hour(s) 00 minute(s)"
 * @param $rootScope - scope pattern
 */
NgApp.filter('setGagElement', function($rootScope) {
    return function(directionsObj, directionsObjKey, lastElement, directionIndex) {
        function getLastActiveDepartElement(departElements) {
            var departElementIndex = 0;
            departElements.each(function(index) {
                if ($(this).hasClass('active')) {
                    departElementIndex = index;
                }
            });
            return departElementIndex;
        }

        function removeAllEmptyFlights() {
            $('li.empty_flight').each(function() {
                $(this).remove();
            })
        }
        removeAllEmptyFlights();
        $('.last_active').removeClass("active_border");
        var departElements = angular.element('.round_list:not(.sibling_list) li');
        var arriveElements = angular.element('.round_list.sibling_list li');
        var activeLastDepartElement = getLastActiveDepartElement(departElements);

        if (directionsObjKey == 1 && lastElement == true && departElements.length != 0 && arriveElements.length != 0) {
            if (departElements.length > arriveElements.length) {

                for (var i= arriveElements.length+1; i < departElements.length; i++) {
                    var emptyFlightEl = '<li class="round_list-li empty_flight"></li>';
                    if (activeLastDepartElement >= i) {
                        emptyFlightEl = '<li class="round_list-li border empty_flight"></li>';
                        $('.last_active').addClass("active_border");
                    }
                    $('.round_list.sibling_list').append(emptyFlightEl);
                }

                if (activeLastDepartElement == arriveElements.length){
                    $('.last_active').addClass("active_border");
                }
            }
        }
        return directionsObj;
    }
});

/**
 * @filter diffTravelTime - filter to parse time in minutes to format - "00 hour(s) 00 minute(s)"
 * @param $rootScope - scope pattern
 * @param $filter - filter pattern
 */
NgApp.filter('currency', function($rootScope, $filter) {
    return function(activeCurrency, rubPrice) {
        try{
            var rubPrice = rubPrice;
            if (angular.isObject(rubPrice) && angular.isDefined(activeCurrency)) {
                rubPrice = $filter('getMinPriceFilter')(activeCurrency, rubPrice);
            }
            return activeCurrency.symbol + Math.round(rubPrice / activeCurrency.value);
        } catch(e) {
        }

    }
})

/**
 * @filter orderObjectBy - filter to order objects
 */
NgApp.filter('orderObjectBy', function () {
    return function (items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function (item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            return (a[field] > b[field] ? 1 : -1);
        });
        if (reverse) filtered.reverse();
        return filtered;
    };
});


