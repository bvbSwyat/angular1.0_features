'use strict';

    describe('ShareController', function () {
        var scope, rootScope, routeParams, controller, http, httpbackend, document, $popupManager, init;
        beforeEach(module('NotesApp'));
        beforeEach(
            inject(function($rootScope, $document, $controller, $routeParams, $httpBackend, $http, popupManager) {
                rootScope = $rootScope;
                scope = $rootScope.$new();
                routeParams = $routeParams;
                controller = $controller;
                http = $http;
                document = $document;
                httpbackend = $httpBackend;
                $popupManager = popupManager;
                init = new InitialDataForUnitTests();
//                var notes_list =  {"data": [
//                    {"type": "note", "id": "524abbb2ca573a60b7b0023a"}
//                ], "success": true}
            var data = {"action": "notes:tags", "body": {"last_update_time": 0}, "loading": true};
            var tagObject = {"errorCode":0, "body": {"last_update_time": 1384433083, "tags":[12232, 'wew']}};
            $httpBackend.when('POST', '/client/notes/action/', data).respond(tagObject);
            })
            );
        afterEach(function () {
            httpbackend.verifyNoOutstandingExpectation();
            httpbackend.verifyNoOutstandingRequest();
        });
        it ('should_be_attach',function(){
            controller('ShareController', { $scope: scope,
                                            $rootScope: rootScope,
                                            $routeParams: routeParams,
                                            $http: http,
                                            popupManager: $popupManager,
                                            $document: document});
            var array = init.getTextForShare()
            for(var text in array){
                var result = scope.isAttach(array[text]);
                expect(result).not.toEqual(text);
            }
        });
    });

