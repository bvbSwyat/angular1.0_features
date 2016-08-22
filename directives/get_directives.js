
/**
 * @directive ngStyleMask - directive for view time, date
 */
NgApp.directive('ngStyleMask', function () {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var now = !Boolean(attrs.value) ? new Date() : new Date(Number(attrs.value) * 1000);
            var flagDay = (attrs.ngModel === 'loyaltyDateTo' && !Boolean(attrs.value)) ? 1 : 0;
            scope[attrs.ngModel] = ((((now.getDate() + flagDay) < 10) ?
                    ('0' + (now.getDate() + flagDay))
                    : (now.getDate() + flagDay))) + '/' +
                (((now.getMonth() + 1 < 10) ?
                    ('0' + (now.getMonth() + 1))
                    : (now.getMonth() + 1)) + '/' +
                now.getFullYear());
            var viewMask = attrs.viewMask;
            element.mask(viewMask);
        }
    };
});


NgApp.directive('scrollLoad', function (restService, $rootScope, $timeout) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            scope.busy = false;
            scope.$on('scroll_down', function (event, data) {
                $timeout(function () {
                    var heightItem = angular.element('.scroller .create_post').height();
                    scope.newPost = (Math.abs(data) > heightItem) ? true : false;
                }, 0);
                if (((angular.element('.ngsb-container').height() - angular.element('.ngsb-wrap').height() + data) <= 10) && !scope.busy) {
                    if (scope.scroll_curr_page !== scope.curr_page) {
                        scope.scroll_curr_page = scope.curr_page;
                        scope.$emit(attrs.scrollLoad);
                    }
                }
            });

            scope.gotoTop = function () {
                $rootScope.$broadcast('scrollTop');
            };

            scope.$watch('busy', function (data) {
                scope.showLoader = data;
            });
        }
    };
});

NgApp.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

NgApp.directive("starRating", function () {
    return {
        restrict: "EA",
        template: "<ul ng-if='stars.length > 0' class='rating' ng-class='{readonly: readonly}'>" +
        "  <li ng-repeat='star in stars' ng-class='star' ng-click='toggle($index)'>" +
        "  </li>" +
        "</ul>",
        scope: {
            ratingValue: "=ngModel",
            stars: "=?",
            max: "=?", //optional: default is 5
            onRatingSelected: "&?",
            readonly: "=?"
        },
        link: function (scope, elem, attrs) {
            if (scope.max == undefined) {
                scope.max = 5;
            }
            function updateStars() {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.toggle = function (index) {
                if (scope.readonly == undefined || scope.readonly == false) {
                    scope.ratingValue = index + 1;
                }
            };
            scope.$watch("ratingValue", function (oldVal, newVal) {
                if (newVal) {
                    updateStars();
                }
            });
        }
    };
});

NgApp.directive('maLogButton', function (localStorageService, $state) {
    return {
        scope: {
            entity: '&',
            entry: '&',
            size: '@',
            label: '@',
            type: '@'

        },
        template: '<a class="btn btn-default" ng-class="size ? \'btn-\' + size : \'\'">' +
                    '<span class="glyphicon " aria-hidden="true"></span>&nbsp;{{ ::label }}' +
                    '</a>',
        restrict: 'E',
        link: function ($scope, $element, $attrs, ngModel) {
            $element.click(function() {
                $state.go('logsView',
                    {districtId: $scope.entry().values.districtid,
                    logId: $scope.entry().values.logid,
                    type: $attrs.type
                    })

            })
        }
    }
})

/**
 * @directive dynamicFormName - change name attribute dynamically
 */
NgApp.directive("dynamicFormName", function() {
    return {
        restrict: "A",
        priority: 0,
        require: ["form"],
        compile: function() {
            return {
                pre: function preLink(scope, element, attrs, ctrls) {
                    var name = "field" + scope.$index;
                    if (attrs.dnfnNameExpression) {
                        name = scope.$eval(attrs.dnfnNameExpression);
                    }
                    var parentForm = element.parent().controller("form");
                    if (parentForm) {
                        var formCtrl = ctrls[0];
                        delete parentForm[formCtrl.$name];
                        formCtrl.$name = name;
                        parentForm[formCtrl.$name] = formCtrl;
                    }
                }
            }
        }
    }
});


/**
 * @directive ngBrowser - directive for checking type browser
 * @param $window - service in module ng
 */

NgApp.directive('ngBrowser', ['$window', '$rootScope', function($window, $rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var u = navigator.userAgent.toLowerCase(),
                is = function (t) {
                    return (u.indexOf(t) != -1)
                };
            scope.browser = [(!(/opera|webtv/i.test(u)) && /msie (\d)/.test(u)) ? ('ie ie' + RegExp.$1)
                    : is('firefox/2') ? 'gecko ff2'
                    : is('firefox/3') ? 'gecko ff3'
                    : is('gecko/') ? 'gecko'
                    : is('opera/9') ? 'opera opera9' : /opera (\d)/.test(u) ? 'opera opera' + RegExp.$1
                    : is('konqueror') ? 'konqueror'
                    : is('applewebkit/') ? 'webkit safari'
                    : is('mozilla/') ? 'gecko' : '',
                (is('x11') || is('linux')) ? ' linux'
                    : is('mac') ? ' mac'
                    : is('win') ? ' win' : ''
            ];
            $rootScope.browser = scope.browser;
        }
    };
}]);

/**
 * @directive ngBrowserIe - directive for checking type browser (Internet Explorer)
 * @param $window - service in module ng
 */

NgApp.directive('ngBrowserIe', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            /**
             * @function scope.msieversion - checking type browser (Internet Explorer)
             * @returns {boolean} - if ie - return true? else - false
             */
            scope.msieversion = function () {
                var ua = $window.navigator.userAgent;
                var msie = ua.indexOf("MSIE ");

                if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                    parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
                    return true;
                }
                return false;
            }
        }
    };
}]);

/**
 * @directive dynamicFormName - change name attribute dynamically
 */
NgApp.directive("dynamicFormName", function() {
    return {
        restrict: "A",
        priority: 0,
        require: ["form"],
        compile: function() {
            return {
                pre: function preLink(scope, element, attrs, ctrls) {
                    var name = "field" + scope.$index;
                    if (attrs.dnfnNameExpression) {
                        name = scope.$eval(attrs.dnfnNameExpression);
                    }
                    var parentForm = element.parent().controller("form");
                    if (parentForm) {
                        var formCtrl = ctrls[0];
                        delete parentForm[formCtrl.$name];
                        formCtrl.$name = name;
                        parentForm[formCtrl.$name] = formCtrl;
                    }
                }
            }
        }
    }
});

NgApp.directive('onlyText', function() {
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
               // this next if is necessary for when using ng-required on your input.
               // In such cases, when a letter is typed first, this parser will be called
               // again, and the 2nd time, the value will be undefined
               if (inputValue == undefined) return ''
               var transformedInput = inputValue.replace(/[^A-z]/g, '');
               if (transformedInput!=inputValue) {
                  modelCtrl.$setViewValue(transformedInput);
                  modelCtrl.$render();
               }
               return transformedInput;
            });
        }
    }
});

/**
 * @directive bookValidator - directive for adding new error validation actions to booking form
 */
NgApp.directive('bookValidator', function($filter) {
    return {
        restrict: 'A',
        scope: {
            exists: '&bookValidator'
        },
        require: 'ngModel',
        link: function ($scope, $element, $attrs, ngModel) {

            $scope.$watch(function() {
                return $scope.exists();
                }, function(formData) {
                    if (angular.isDefined(formData)) {
                        switch($attrs.ngModel) {
                            case 'bookPhone':
                                var phonePattern = /^[+]{1}[0-9]{12,13}$/;
                                if (formData == "") {
                                    ngModel.$setValidity('required', false);
                                    ngModel.$setValidity('bad_format', true);
                                } else if(!phonePattern.test(formData)) {
                                    ngModel.$setValidity('bad_format', false);
                                    ngModel.$setValidity('required', true);
                                } else {
                                    ngModel.$setValidity('bad_format', true);
                                    ngModel.$setValidity('required', true);
                                }
                                break;
                        }
                    }
            });

            /**
             *
             * @param date - date from birth date input in format - dd.MM.yyyy
             * @returns {boolean} - true if in time perion from 01.01.1990 to current date, else false
             */
            function isValidDate(date) {
                var date = new Date(date.replace(/([0-9]+).([0-9]+)/,'$2.$1'));
                var today = new Date();
                var minDate = new Date('01.01.1990');
                if (date != 'Invalid Date' && today.getTime() > date.getTime() && minDate.getTime() < date.getTime()) {
                    return true;
                }
                return false;
            }
        }
    }
});

/**
 * @directive clickOutside - directive that work when click outside element which initialised like directive parameter
 * @param $document - wrapper for the browser's window.document object
 */
NgApp.directive('clickOutside', function($document) {
    return {
        restrict: 'A',
        scope: {
            clickOutside: '&'
        },
        link: function ($scope, elem, attr) {
            var classList = (attr.outsideIfNot !== undefined) ? attr.outsideIfNot.replace(', ', ',').split(',') : [];
            if (attr.id !== undefined) classList.push(attr.id);

            $document.on('click', function (e) {
                var i = 0,
                    element;

                if (!e.target) return;

                for (element = e.target; element; element = element.parentNode) {
                    var id = element.id;
                    var classNames = element.className;

                    if (id !== undefined) {
                        for (i = 0; i < classList.length; i++) {
                            if(!angular.isObject(classNames)) {
                                if (id.indexOf(classList[i]) > -1 || classNames.indexOf(classList[i]) > -1) {
                                    return;
                                }
                            }
                        }
                    }
                }

                $scope.$eval($scope.clickOutside);
            });
        }
    };
})

/**
 * @directive ngMatch - directive for check matching passwords
 * @param $parse - service for parsing directive parameter
 */
NgApp.directive('ngMatch', function ($parse) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, elem, attrs, ctrl) {
            if (!ctrl) return;
            if (!attrs['ngMatch']) return;

            var firstPassword = $parse(attrs['ngMatch']);
            var validator = function (value) {
            var temp = firstPassword(scope),
            v = value === temp;
            ctrl.$setValidity('match', v);
            return value;
            }

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.push(validator);
            attrs.$observe('ngMatch', function () {
                validator(ctrl.$viewValue);
            });
        }
    }
});

/**
 * @directive leafletMap - directive that working with leaflet
 *
 * @param $rootScope - scope pattern
 * @param leaService - service that wrap standart leaflet functions
 * @param bingService - service that wrap standart bing functions
 */
NgApp.directive('leafletMap', function($rootScope, leaService, bingService, restService, $interval) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            scope.mapLocations = [{
                firstLocation: {
                    name: null,
                    coordinates: null,
                    airport_code: null,
                    city_name: null,
                    country_name: null
                },
                secondLocation: {
                    name: null,
                    coordinates: null,
                    airport_code: null,
                    city_name: null,
                    country_name: null
                }
            }];

            scope.entities = [{
                firstLocation: {
                    "marker": null
                },
                secondLocation: {
                    "marker": null
                }
            }];

            leaService.initMap();

            /**
             * @function changedLocation - function wrapper for deleting old pointers
             * @param sityName string - name of sity
             * @param panelIndex int - object index that included current model
             * @param autoIndex string - model key that was changed
             */
            scope.changedLocation = function(complObj, panelIndex, autoIndex, currentLang) {
                if(locationsAlreadySeted(panelIndex, autoIndex)) {
                    scope.removeOldElements(panelIndex, autoIndex);
                }
                if (complObj.city != false) {
                    if  (angular.isDefined(currentLang) && currentLang.code != 'en') {
                        restService.getAirportsData(complObj.code, 'en').then(function (requestData) {
                            var clone = $rootScope.getObj(requestData, 'code', complObj.code)
                            if (angular.isDefined(clone)) {
                                complObj.en_name = clone.name;
                            } else if (angular.isDefined(requestData[0]) && angular.isDefined(requestData[0].name)) {
                                complObj.en_name = requestData[0].name;
                            }
                            bingService.getCityCoordinates(complObj, panelIndex, autoIndex);

                        });
                    } else {
                        bingService.getCityCoordinates(complObj, panelIndex, autoIndex);
                    }
                }
            }

            /**
             * @function addMarker - function for setting pointer
             * @param locObj - locations of pointer
             * @param panelIndex int - object index that included current model
             * @param autoIndex string - model key that was changed
             */
            scope.addMarker = function(locObj, panelIndex, autoIndex, complObj) {
                var coords = scope.mapLocations[panelIndex][autoIndex].coordinates = locObj[0].location;
                var autocompleteIndex = autoIndex == "firstLocation" ? 1 : 2;
                var markerNumber = autocompleteIndex * (panelIndex+1);
                scope.entities[panelIndex][autoIndex].marker = leaService.addMarker([coords.latitude, coords.longitude], complObj, markerNumber);
                scope.mapLocations[panelIndex][autoIndex].airport_code = complObj.code;
                scope.mapLocations[panelIndex][autoIndex].country_name = complObj.country_name;
                scope.mapLocations[panelIndex][autoIndex].city_name = complObj.name;
                switch (autoIndex) {
                    case "firstLocation": {
                        if (locationsAlreadySeted(panelIndex, "secondLocation")) {
                            var firstCoords = scope.mapLocations[panelIndex][autoIndex].coordinates;
                            var secondCoords = scope.mapLocations[panelIndex]["secondLocation"].coordinates;
                            leaService.drawGeodesicLine(new L.LatLng(firstCoords.latitude, firstCoords.longitude),
                                                        new L.LatLng(secondCoords.latitude, secondCoords.longitude));
                        }
                        break;
                    }
                    case "secondLocation": {
                        if (locationsAlreadySeted(panelIndex, "firstLocation")) {
                            var firstCoords = scope.mapLocations[panelIndex]["firstLocation"].coordinates;
                            var secondCoords = scope.mapLocations[panelIndex][autoIndex].coordinates;
                            leaService.drawGeodesicLine(new L.LatLng(firstCoords.latitude, firstCoords.longitude),
                                                        new L.LatLng(secondCoords.latitude, secondCoords.longitude));
                        }
                        break;
                    }
                }
            }

            /**
             * @function removeOldElements - if we need change location of pointe we must remove old pointer
             * @param panelIndex int - object index that included current model
             * @param autoIndex string - model key that was changed
             */
            scope.removeOldElements = function(panelIndex, autoIndex) {
                leaService.removePoint();
                leaService.removePoint(scope.entities[panelIndex][autoIndex].marker);
            }

            /**
             * @handler onSearchComplete - if search coordinates completed good we must set marker
             * @param locObj - locations of pointer
             * @param panelIndex int - object index that included current model
             * @param autoIndex string - model key that was changed
             */
            $rootScope.$on('onSearchComplete', function(e, locObj, panelIndex, autoIndex, complObj) {
                if (angular.isDefined(locObj)
                    && angular.isDefined(panelIndex)
                    && angular.isDefined(autoIndex)
                    && angular.isDefined(complObj)) {
                    scope.addMarker(locObj, panelIndex, autoIndex, complObj);
                    if ($rootScope.activeMap == false) {
                        $interval(function() {
                            scope.hideMap("active_my_account", true);
                        },50, 25);
                    }
                }
            });

            /**
             * @function locationsAlreadySeted - check if location already setted
             * @param panelIndex int - object index that included current model
             * @param autoIndex string - model key that was changed
             */
            var locationsAlreadySeted = function(panelIndex, autoIndex) {
                if (scope.mapLocations[panelIndex][autoIndex].coordinates != null) {
                    return true;
                }
                return false;
            }

            /**
             * @function hideMap - show or hide map
             * @param className - string, add or remove this class name
             * @param flag - boolean, true - hide map, false/other - show map
             */
            scope.hideMap = function (className, flag) {
                if (flag) {
                    element.find(".leaflet-layer").addClass(className);
                    element.find(".leaflet-objects-pane").addClass(className);
                    $(".leaflet-layer").foggy({
                        blurRadius: 2,
                        opacity: 1
                    });
                    $rootScope.activeMap = false;
                } else {
                    if ($('.ticket_list').is(':visible') == false) {
                        element.find(".leaflet-layer").removeClass(className);
                        element.find(".leaflet-objects-pane").removeClass(className);
                        $(".leaflet-layer").removeAttr('style');
                        $(".leaflet-layer").removeAttr('count');
                        var foggy = $('.foggy-pass-relative img');
                        if (foggy.length > 0) {
                            $(".leaflet-layer").html(foggy);
                        }
                        $rootScope.activeMap = true;
                    }
                }
            }
        }
    }
})

/**
 * @directive focusMe - directive for focusing element or nested input element or relative inputs when current is disabled
 */
ngApp.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      $timeout(function() {
        //check on disabled property
        if (attrs.disabled) {
          //set focus on next input field
          element.closest("form").find('input').each(function(index) {
            if($(this)[0].disabled === false) {
              $(this)[0].focus();
              return false;
            }
          });
        }
        if(element[0].localName == 'input') {
          element[0].focus();
        } else {
          element.find('input').focus();
        }
      }, 500);
    },
  };
})

/**
 * @directive groupDate - directive for getting date data and setting in object
 */
ngApp.directive('groupDate', function($rootScope) {
  return {
    restrict: 'E',
    scope: {
      'groupDates': "=",
      'dateType': "@",
      'date': "@",
      'checkitemId': "@",
    },
    link: function($scope, element, attrs) {
      $rootScope.$on('reinitGroupDates', function() {
        $scope.groupDates[$scope.dateType][$scope.checkitemId] = $scope.date;
      });
      $scope.groupDates[$scope.dateType][$scope.checkitemId] = $scope.date;
    },
  };
})
