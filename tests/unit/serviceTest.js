
'use strict';

describe('ServiceTests', function(){
    var $httpBackend;
    var $rootScope;
    var restService;
    var businessManager;
    var compile, scope;

    beforeEach(function(){
        module('NgApp');
        inject(function($injector, $compile){
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            restService = $injector.get('restService');
            businessManager = $injector.get('businessFiltersManager');
            scope = $rootScope.$new();
            compile = $compile;
        });
    });
});