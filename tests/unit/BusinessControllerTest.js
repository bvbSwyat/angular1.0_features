

describe('ControllerTest: BusinessController', function () {
    beforeEach(module('NgApp'));

    var Ctrl, scope, modalInstance, init, $httpBackend, mainCtrl;

    // Initialize the controller and a mock scope
    beforeEach(inject(
            function ($controller, $rootScope, $injector, $state) {
                init = new InitialDataForUnitTests();
                scope = $rootScope.$new();
                $httpBackend = $injector.get('$httpBackend');
                mainCtrl = $controller('MainController', {
                    $scope: scope
                });
                Ctrl = $controller('BusinessController', {
                    $scope: scope
                });

                $httpBackend.expectGET("/json/en-us.json").respond();
                $httpBackend.expectGET("user").respond();
                $httpBackend.expectGET("views/header.html").respond();
                $httpBackend.expectGET("views/content-business.html").respond();
                $httpBackend.expectGET("views/business/content.html").respond();
                $httpBackend.expectGET("views/content-channel.html").respond();
                $httpBackend.expectGET("views/channel/channel_list.html").respond();
                $state.go('business.all_users');
                $httpBackend.flush();
                scope.$apply();
            })
    );

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should go first on channnels page', inject(function ($state) {
        expect($state.current.name).toBe('channels.list');
    }));

    it('should trigger "$stateChangeSuccess" event handler', inject(function ($state) {
        $httpBackend.expectGET("user/business").respond(init.businessData);
        expect(scope.businessList).toBeUndefined();
        $state.go('business.active');
        $httpBackend.flush();
        scope.$apply();
        expect(scope.businessList).toBeDefined();
        expect($state.current.name).toBe('business.active');
    }));

    it('should init "companyList" obj field in add user page', inject(function ($state) {
        $httpBackend.expectGET("views/business/add_user.html").respond();
        $httpBackend.expectGET("user/company").respond(init.businessData.company);
        expect(scope.businessList).toBeUndefined();
        $state.go('business.add_user');
        $httpBackend.flush();
        scope.$apply();
        expect(scope.businessList).toBeUndefined();
        expect(scope.companyList).toBeDefined();
        expect(scope.companyList.length).toEqual(1);
    }));

    it('should check "businessFiltersManager" work after "$stateChangeSuccess" event handler was done on active companies all_users page', inject(function ($state) {
        $httpBackend.expectGET("user/business").respond(init.businessData);
        $state.go('business.all_users');
        $httpBackend.flush();
        expect(init.businessData.user).toEqual(scope.businessList.user); //view all users
        var users_value = init.businessData.user.length;
        expect(scope.businessList.company[0].users_value).toEqual(users_value); //view all users
        expect($state.current.name).toBe('business.all_users');
    }));

});