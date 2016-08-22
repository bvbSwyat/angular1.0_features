

'use strict';

describe('ControllerTest: PublishController', function () {
    var $rootScope,
        $httpBackend,
        $state,
        mainCtrl;

    beforeEach(module('NgApp'));

    var Ctrl, scope, init;
    beforeEach(inject(function ($injector, $controller, _$rootScope_, _$state_) {
        init = new InitialDataForUnitTests();
        $rootScope = _$rootScope_;
        $httpBackend = $injector.get('$httpBackend');
        scope = $rootScope.$new();
        Ctrl = $controller('PublishController', {
            $scope: scope
        });
        $state = _$state_;
        mainCtrl = $controller('MainController', {
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

    it('function: validatePost', function() {
        $httpBackend.flush();
        var preData = init.prepereValidationData();
        var validationResult = {};
        var result = scope.validatePost(preData);
        expect(result).toEqual(validationResult);

        preData.mail_flag = true;
        var result = scope.validatePost(preData);
        expect(result).toEqual(validationResult);
        expect(Object.keys(result).length).toEqual(Object.keys(validationResult).length);
    });

    it('function: validatePostEmpty', function() {
        $httpBackend.flush();
        var preData = {};
        var validationResult = {
            time: 'Selected time is invalid',
            date: 'Selected date is invalid',
            required: 'This field may not be blank.'
        };
        var result = scope.validatePost(preData);
        expect(Object.keys(result)).toEqual(Object.keys(validationResult));
        expect(Object.keys(result).length).toEqual(Object.keys(validationResult).length);
    });

    it('function: validatePostMail', function() {
        $httpBackend.flush();
        var preData = init.prepereValidationData();
        preData.mail_flag = true;
        preData.subject = '';
        var validationResult = {
            subject: 'The subject is empty'
        };
        var result = scope.validatePost(preData);
        expect(Object.keys(result)).toEqual(Object.keys(validationResult));
        expect(Object.keys(result).length).toEqual(Object.keys(validationResult).length);
    });

    it('function: validatePost(twitterErrorLength)', function() {
        $httpBackend.flush();
        var twitterLength = 140, text = '';
        var preData = init.prepereValidationData();
        for (var i=0; i <= twitterLength; i++) {
            text = text + 'a';
        }
        preData.text = text;
        var validationResult = {twitter: 'Ensure this field has no more than 140 characters.'};
        var result = scope.validatePost(preData);
        expect(Object.keys(result)).toEqual(Object.keys(validationResult));
        expect(Object.keys(result).length).toEqual(Object.keys(validationResult).length);
    });

    it('function: validatePost(linkedinErrorLength)', function() {
        $httpBackend.flush();
        var linkedinLength = 600, text = '';
        var preData = init.prepereValidationData();
        for (var i=0; i <= linkedinLength; i++) {
            text = text + 'a';
        }
        preData.text = text;
        delete preData.channels.twitter;
        var validationResult = {linkedin: 'Ensure this field has no more than 600 characters.'};
        var result = scope.validatePost(preData);
        expect(Object.keys(result)).toEqual(Object.keys(validationResult));
        expect(Object.keys(result).length).toEqual(Object.keys(validationResult).length);
    });

    it('function: validatePost(facebookErrorLength)', function() {
        $httpBackend.flush();
        var facebookLength = 64206, text = '';
        var preData = init.prepereValidationData();
        for (var i=0; i <= facebookLength; i++) {
            text = text + 'a';
        }
        preData.text = text;
        delete preData.channels.twitter;
        delete preData.channels.linkedin;
        var validationResult = {facebook: 'Ensure this field has no more than 64206 characters.'};
        var result = scope.validatePost(preData);
        expect(Object.keys(result)).toEqual(Object.keys(validationResult));
        expect(Object.keys(result).length).toEqual(Object.keys(validationResult).length);
    });

});

