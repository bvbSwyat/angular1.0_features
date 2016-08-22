/**
 * Created by swyat on 20.08.15.
 */

/*jslint browser: true*/
/*global $, angular, getUnitName, navigator*/

/**
 * @filter getUnitName - function for getting right unit value name
 * @param GlobalSettingsStorage - service with global values
 */
angular.module('ngApp')
    .filter("getUnitName", function (GlobalSettingsStorage) {
        return function (value, unitsType, unitsCategory, unitsAbbr) {
            if (angular.isDefined(unitsAbbr)) {
                var needUnitAbbreviature = unitsAbbr == 'abbreviation';
                var unitObj = GlobalSettingsStorage.units[unitsType][unitsCategory];
                var unitName = needUnitAbbreviature ? unitObj.abbreviation : unitObj.unit;
                var acceptableUnitsForSArray = [
                    "kilometer",
                    "meter",
                    "liter",
                    "nautical mile",
                    "knot",
                    "gallon",
                    "kt",
                    "mile"];
                var needS = (value == 0 || value > 1) && acceptableUnitsForSArray.indexOf(unitName) != -1;
                    if (needS == true)
                        unitName += 's';
                    if (angular.isDefined(unitObj.per_hour)) {
                        unitName += " per hour";
                    }
                }
            return unitName;
        };
    })