'use strict';

    describe('UserController', function () {
        var scope, rootScope, routeParams, controller, http, httpbackend, $popupManager, init;
        beforeEach(module('NotesApp'));
        beforeEach(
            inject(function($rootScope, $controller, $httpBackend, $http, popupManager) {
                rootScope = $rootScope;
                scope = $rootScope.$new();
                controller = $controller;
                http = $http;
                httpbackend = $httpBackend;
                $popupManager = popupManager;
                init = new InitialDataForUnitTests();
            })
        );
        afterEach(function () {
            httpbackend.verifyNoOutstandingExpectation();
            httpbackend.verifyNoOutstandingRequest();
        });
        it ('should_get_user_status',function(){
            controller('UserController', { $scope: scope,
                                            $http: http,
                                            popupManager: $popupManager});
            httpbackend.when('POST', '/client/quota/stats').respond(init.getUserStatus());
            var result = scope.initUser();
            httpbackend.flush();

            expect(scope.used).toMatch(/^[0-9\.]*$/);
            expect(scope.total).toMatch(/^[0-9\.]*$/);
            expect(result).toBeFalsy('Function saveNoteData not working correctly');

        })
    });
