'use strict';

describe('ControllerTest: ChartController', function () {
    var $rootScope,
        $httpBackend;

    beforeEach(module('NgApp'));

    var Ctrl, scope, init;
    beforeEach(inject(function ($injector, $controller, _$rootScope_) {
        init = new InitialDataForUnitTests();
        $rootScope = _$rootScope_;
        $httpBackend = $injector.get('$httpBackend');
        scope = $rootScope.$new();
        Ctrl = $controller('ChartController', {
            $scope: scope
        });
    })
    );
    beforeEach(inject(function(){
        $httpBackend.expectGET("/json/en-us.json").respond();
        $httpBackend.expectGET("user").respond();
        $httpBackend.expectGET("views/header.html").respond();
        $httpBackend.expectGET("views/content-channel.html").respond();
        $httpBackend.expectGET("views/channel/channel_list.html").respond();
        $rootScope.$apply();
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('function: getRandomColor', function() {
        $httpBackend.flush();
        var color = scope.getRandomColor();
        var letters = '#0123456789ABCDEF'.split('');
        color = color.split('');
        expect(color.length).toBe(7);
        $.map(color, function (elem, i) {
            expect(letters.indexOf(elem)).not.toBe(-1);
        })
    });

    it('function: getChartData (check data in chart)', function() {
        $httpBackend.flush();
        var chartData = scope.getChartData(init.analyzeData());
        $.map(chartData.wrapData, function (elem, i) {
            $.map(elem, function (item, k) {
                if (i != 0) {
                    expect(typeof (item)).toBe('number');
                }
            })
        });

        //invalid twitter data (checking data)
        expect(Object.keys(init.analyzeDataNew()).length).toBe(3);
        var chartData_ = scope.getChartData(init.analyzeDataNew());
        expect(Object.keys(chartData_.analyzeDataCustom).length).toBe(2);
    });

    it('function: connectToGoogle', function() {
        $httpBackend.flush();
        $httpBackend.expectGET("channels/connect/google").respond();
        scope.connectToGoogle();
        $httpBackend.flush();

    });
});