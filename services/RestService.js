/**
 * Created by swyat on 17.07.15.
 */

/**
 *  @factory GlobalSettingsStorage - global data for all the site
 *
 *  @param UnitsConstants - constants for units values
 *  @return object - object of global settings
 */
/*jslint browser: true*/
/*global $, angular, Cesium*/
angular.module('ngApp')
    .factory("RestService", function (Restangular, AppConfig) {
        return {
            getProfile : function (email) {
                return Restangular.one("person").get({email: email, apiKey: self.apiKey});
            },
            getMetars: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.metarPathUrl).get();
            },
            getTafs: function () {
                return Restangular.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.setJsonp(false);
                }).one(AppConfig.apiTafPathUrl).get();
            },
            getAirports: function () {
                return Restangular.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.setJsonp(false);
                }).one(AppConfig.apiAirportPathUrl).get();
            },
            getAreaForecasts: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.areaForecasts).get();
            },
            getAirmets: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.airmetPathUrl).get();
            },
            getSigmets: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.sigmetPathUrl).get();
            },
            getIsigmets: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.isigmetPathUrl).get();
            },
            getGairmet0: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.gairmetPathUrl0).get();
            },
            getGairmet3: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.gairmetPathUrl3).get();
            },
            getGairmet6: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.gairmetPathUrl6).get();
            },
            getGairmet9: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.gairmetPathUrl9).get();
            },
            getGairmet12: function () {
                return Restangular.oneUrl("/map", AppConfig.weatherServerUrl + AppConfig.gairmetPathUrl12).get();
            }
        }
    });