/**
 * Created by swyat on 17.09.15.
 */

/*jslint browser: true*/
/*global $, angular, convertUnits, navigator*/

/**
 * @filter convertUnits - function for converting units to other units
 * @param GlobalSettingsStorage - service with global values
 * @param $filter - service for filtering data
 */
angular.module('ngApp')
    .filter("convertUnits", function (GlobalSettingsStorage, $filter) {
        return function (value, unitsType, unitsCategoryFrom, unitsCategoryTo, unitsAbbr) {
            if (angular.isDefined(value)) {
                if (angular.isDefined(unitsType)
                    && angular.isDefined(unitsCategoryFrom)
                    && angular.isDefined(unitsCategoryTo)) {
                    var needToConvertInMetric = ((unitsCategoryFrom == "nautical" || unitsCategoryFrom == "statute")
                        && (unitsCategoryTo == "nautical" || unitsCategoryTo == "statute"))
                        || unitsCategoryTo == 'metric';
                    var needToConvertNotToMetric = unitsCategoryTo != 'metric';
                    // if we need to convert statute to nautical or to metric
                    if (needToConvertInMetric) {
                        //console.log('convert to metric');
                        var metricCoeff = GlobalSettingsStorage.units[unitsType][unitsCategoryFrom].value;
                        value = value != 0 ? value / metricCoeff : 0;
                        //console.log(value)
                    }
                    // if we need to convert statute to nautical or revert
                    if (needToConvertNotToMetric) {
                        //console.error('convert not to metric');
                        var unitToConvertCoeff = GlobalSettingsStorage.units[unitsType][unitsCategoryTo].value;
                        value *= unitToConvertCoeff;
                    }
                    value = Math.round(value);
                }
            }
            return angular.isDefined(unitsAbbr)
                ? Math.round(value / 100) * 100 + " " + $filter('getUnitName')(value, unitsType, unitsCategoryTo, unitsAbbr)
 	            : Math.round(value / 100) * 100;
        }
    })
