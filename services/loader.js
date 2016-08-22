'use strict';


angular.module('loadingApp', [])

.factory('loaderValues', function() {
  return {};
})

.factory('loader', function(loaderValues) {
  return function(name) {
    if (!name) {
      name = '';
    }
    var self = this;
    this.name = name;
    if (!loaderValues[this.name]) {
      loaderValues[this.name] = 0;
    }
    this.load = function(promise) {
      if (promise !== undefined) {
        promise.finally(function() {
          self.done();
        });
      }
      loaderValues[self.name]++;
    };
    this.done = function() {
      if (loaderValues[self.name] === 0) {
        return;
      }
      loaderValues[self.name] = 0;
    };
    this.isLoading = function() {
      return loaderValues[self.name] !== 0;
    };
  };
})

.directive('loading', function(loader) {
  return {
    restrict: 'A',
    transclude: true,
    scope: {},
    templateUrl: 'partials/loader.jade',
    link: function(scope, element, attrs) {
      scope.loader = new loader(attrs.loading);
      scope.$watch('loader.isLoading()', function(newVal) {
        if (newVal) {
          element.addClass('loaderLoading');
        } else {
          element.removeClass('loaderLoading');
        }
      });

      var opts = {
        lines: 8, // The number of lines to draw
        length: 4, // The length of each line
        width: 11, // The line thickness
        radius: 14, // The radius of the inner circle
        corners: 0.6, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#444', // #rgb or #rrggbb or array of colors
        speed: 0.8, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: 'auto', // Top position relative to parent in px
        left: 'auto', // Left position relative to parent in px
      };
      var target = element.children()[0];
      var spinner = new Spinner(opts).spin(target);
    },
  };
});
