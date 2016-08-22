

'use strict';

describe('ControllerTest: MainController', function () {
    var $rootScope,
        $httpBackend,
        $state,
        $translate;

    beforeEach(module('NgApp'));

    var Ctrl, scope, init;
    beforeEach(inject(function ($injector, $controller, _$rootScope_, _$state_, _$translate_) {
        init = new InitialDataForUnitTests();
        $rootScope = _$rootScope_;
        $httpBackend = $injector.get('$httpBackend');
        scope = $rootScope.$new();
        Ctrl = $controller('MainController', {
            $scope: scope
        });
        $state = _$state_;
        $translate = _$translate_;
        window.outdatedBrowser = function (data) {return data};
        window.Modernizr = {
            'svg': true
        };
    })
    );
    beforeEach(inject(function(){
        $httpBackend.when('GET', "/json/en-us.json").respond(200);
        $httpBackend.expectGET("user").respond();
        $httpBackend.expectGET("views/header.html").respond();
        $httpBackend.expectGET("views/content-channel.html").respond();
        $httpBackend.expectGET("views/channel/channel_list.html").respond();
        $rootScope.$apply();
        $state = {
            url: '/login'
        };
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('function: initMainCtrl', function() {
        $httpBackend.flush();
        scope.initMainCtrl();
        expect(scope.detectOutdatedBrowser()).toEqual({bgColor: '#f25648', color: '#ffffff', lowerThan: 'transform'});
    });

    it('function: getUserInfo', function() {
        $httpBackend.flush();
        $httpBackend.expectGET("user").respond(function () {
            return [200, init.userInfo().data, init.userInfo().headers];
        });
        scope.getUserInfo($state);
        $httpBackend.flush();
        expect($rootScope.anotherUser).toBe(false);
        expect(scope.userInfo.post_count).toBe(61);
        expect(scope.userInfo.responses_count).toBe(0);
        expect(scope.userInfo.added_users_count).toBe(4);
        expect(scope.adminFlag).toBe(true);
    });

    it('function: getUserInfo: activeUser', function() {
        $httpBackend.flush();
        $httpBackend.expectGET("user").respond(function () {
            return [200, init.userInfo().data, init.userInfo().headersAlien];
        });
        scope.getUserInfo($state);
        $httpBackend.flush();
        expect($rootScope.anotherUser).toBe(true);
        expect(scope.adminFlag).toBe(false);
    });

    it('function: getUserInfo (Reseller)', function() {
        $httpBackend.flush();
        $httpBackend.expectGET("user").respond(function () {
            return [200, init.userInfo().data, init.userInfo().headersReseller];
        });
        scope.getUserInfo($state);
        $httpBackend.flush();
        expect(scope.adminFlag).toBe(false);
    });

    it('function: getUserInfo: function: activeScroll', function() {
        $httpBackend.flush();
        $httpBackend.expectGET("user").respond(function () {
            return [200, init.userInfo().data, init.userInfo().headers];
        });
        var body = angular.element('body');
        scope.getUserInfo($state);
        $httpBackend.flush();
        expect(body.hasClass('active_page')).toBe(false);
    });

    it('function: getUserInfo: function: activeScroll ()', function() {
        $httpBackend.flush();
        $httpBackend.expectGET("user").respond(function () {
            return [200, init.userInfo().data, init.userInfo().headers];
        });
        var newState = {
            url: '/some/link'
        };
        var body = angular.element('body');
        body.addClass('active_page');
        scope.getUserInfo(newState);
        $httpBackend.flush();
        expect(body.hasClass('active_page')).toBe(true);
    });

});
