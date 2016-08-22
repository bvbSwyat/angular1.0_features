

"use strict";

describe('DirectiveTests', function() {
    var $compile,
        $rootScope,
        init,
        $httpBackend,
        restService,
        scope,
        $cookies,
        user,
        $cookieStore,
        mainCtrl,
        publishCtrl,
        chartCtrl,
        popupCtrl,
        profileCtrl,
        $state,
        businessFiltersManager,
        scrollList,
        modalInstance,
        $log,
        $translate,
        $filter;

    // Load the myApp module, which contains the directive
    beforeEach(module('NgApp'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function($injector, $controller, _$compile_, _$rootScope_, _$cookies_, _$state_, _$log_, _$translate_, _$filter_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = $injector.get('$httpBackend');
        restService = $injector.get('restService');
        scrollList = $injector.get('scrollList');
        businessFiltersManager = $injector.get('businessFiltersManager');
        scope = $rootScope.$new();
        $cookies = _$cookies_;
        $state = _$state_;
        $log = _$log_;
        $translate = _$translate_;
        $cookieStore = $injector.get('$cookieStore');
        $filter = _$filter_;
        modalInstance = {
        close: jasmine.createSpy('modalInstance.close'),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then')
        }
      };
        mainCtrl = $controller('MainController', {
                $scope: scope
        });
        chartCtrl = $controller('ChartController', {
            $scope: scope
        });
        popupCtrl = $controller('PopupController', {
            $scope: scope,
            $modalInstance: modalInstance,
            popupData: {}
        });
        init = new InitialDataForUnitTests();
        user = init.user();
        jasmine.clock().install();
    }));
    beforeEach(inject(function(){
        $httpBackend.expectGET("/json/en-us.json").respond();
        $httpBackend.expectGET("user").respond();
        $httpBackend.expectGET("views/header.html").respond();
        $httpBackend.expectGET("views/content-channel.html").respond();
        $httpBackend.expectGET("views/channel/channel_list.html").respond();
        $rootScope.$apply();
        $httpBackend.expectGET("views/content-publish.html").respond();
        $httpBackend.expectGET("views/publish/rss/navigation.html").respond();
        $httpBackend.expectGET("views/publish/rss/add_channel.html").respond();
        $state.go('publish.rss_feed.add');
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        jasmine.clock().uninstall();
    });

    describe('DirectiveTest: loginForm', function(_$state_) {
        $state = _$state_;
        beforeEach(inject(function(){
            $rootScope.$apply();
            var tpl = init.loginDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('directive: loginForm', function() {
            $httpBackend.flush();
            $httpBackend.expectPOST("user/login").respond({"user_id": user.user_id});
            $httpBackend.expectPOST("user/login").respond({"user_id": user.user_id});
            scope.loginFormData = {
                "name": user.user_name,
                "password": user.password
            };
            expect(restService.loginUser(scope.loginFormData)).toBeDefined();
            scope.login();
            $httpBackend.flush();
            expect($rootScope.user.user_id).toBe(user.user_id);
            expect($rootScope.user.user_name).toBe(user.user_name);
            expect(scope.incorrectLogin).toBe(false);
            expect(scope.loginFormData.name).toBe(null);
            expect(scope.loginFormData.password).toBe(null);
        });
    });

    describe('DirectiveTest: postStatistic', function() {
        beforeEach(inject(function(){
            $rootScope.$apply();
        }));

        it('directive: postStatistic', function() {
            $httpBackend.flush();
            var tpl = init.postStatisticDirective();
            var statistic = init.posts().results[0].statistic;
            var statistic_1 = init.posts().results[14].statistic;
            var element = $compile(tpl)(scope);
            scope.$digest();
            scope.getPostStatistic(statistic);
            expect(scope.postStatistic).toBe(true);
            $.map(scope.postList, function (channel, key) {
                $.map(channel, function(item, i) {
                    expect(item['comments']).toBe(0);
                    expect(item['likes']).toBe(3);
                    expect(item['reposts']).toBe(0);
                })
            })

            scope.getPostStatistic(statistic_1);
            expect(scope.postStatistic).toBe(false);
            expect(angular.equals({}, scope.postList)).toBe(true);
            expect(scope.postStatistic).toBe(false);
        });
    });

    describe('DirectiveTest: addUser', function() {
        beforeEach(inject(function(){
            var tpl = init.addUserDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('directive: addUser', function() {
            $httpBackend.flush();
            scope.createFormData = {
                name: user.user_name,
                email: user.user_email,
                company: user.user_company,
                type: 'User'
            };
            scope.companyList  = init.companyList;
            scope.addCurrentCompany(scope.createFormData.company);
            expect(scope.submitted).toBe(false);
            expect(scope.createFormData.name).not.toBe(user.user_email);
            expect(scope.createFormData.type).toBe("User");
            expect(scope.submitted).toBe(false);
        });
    })

    describe('DirectiveTest: createPost', function() {
        beforeEach(inject(function($controller){
            publishCtrl = $controller('PublishController', {
                $scope: scope
            });
            $httpBackend.expectGET("views/publish/create_post.html").respond();
            $httpBackend.expectGET("channels/available").respond(init.responseAvailableChannels());
            $httpBackend.expectGET("channels/available").respond(init.responseAvailableChannels());
            $rootScope.$apply();
            $rootScope.activeProject = init.projects()[0];
            var tpl = init.createPostDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
            scope.getAvailableChannels(init.posts().results[0].post.id);
            scope.showMainMessage = function() {};
            $rootScope.removeImg = function(data) {return data;}
            spyOn($rootScope, '$broadcast').and.callThrough();
        }));

        it('directive: createForm', function() {
            $httpBackend.flush();
            expect(scope.available_channels).not.toBe(undefined);
            expect(scope.send_channels).not.toBe(undefined);

            expect(scope.available_channel_ids.facebook[0]).toBe(scope.send_channel_ids[0]);
            expect(scope.available_channel_ids.facebook[1]).toBe(scope.send_channel_ids[1])
            expect(scope.available_channel_ids.twitter[0]).toBe(scope.send_channel_ids[2]);
        });

        it('directive: createForm (function: add_channel_to_send)', function() {
            $httpBackend.flush();
            var id = $rootScope.activeProject.id;
            var type_channel = 'facebook';
            var type_channel1 = 'twitter';
            var type_channel2 = 'gotmail';
            var type_channel3 = 'linkedin';
            var cookieObj = $cookieStore.get('project_channels')[id];
            var count_pages = cookieObj.send_channels[type_channel].length;
            var count_pages1 = cookieObj.send_channels[type_channel1].length;
            var count_pages2 = cookieObj.send_channels[type_channel2].length;
            var count_pages3 = cookieObj.send_channels[type_channel3].length;
            expect(cookieObj.send_channel_ids.length).toBe(count_pages + count_pages1 + count_pages2 + count_pages3);
            scope.add_channel_to_send(type_channel, scope.available_channels[type_channel]);

            expect($cookieStore.get('project_channels')[id].send_channels[type_channel]).toBe(undefined)
            expect($cookieStore.get('project_channels')[id].send_channel_ids.length).toBe(count_pages1 + count_pages2 + count_pages3);

            scope.add_channel_to_send(type_channel, scope.available_channels[type_channel]);
            expect($cookieStore.get('project_channels')[id].send_channels[type_channel]).not.toBe(undefined);
            expect($cookieStore.get('project_channels')[id].send_channel_ids.length).toBe(count_pages + count_pages1 + count_pages2 + count_pages3);
        });

        it('directive: createForm (function: add_profile_to_send)', function() {
            $httpBackend.flush();
            var id = $rootScope.activeProject.id;
            var send_channel_ids = $cookieStore.get('project_channels')[id].send_channel_ids;
            var count = send_channel_ids.length;
            scope.add_profile_to_send(send_channel_ids[0]);
            expect($cookieStore.get('project_channels')[id].send_channel_ids.length).toBe(count - 1);
        });

        it('directive: createForm (function: create_post)', function() {
            $httpBackend.flush();
            var action = 'save';
            var postItem = init.posts().results[0];
            var responsePost = angular.copy(postItem.post);
            responsePost.scheduled_publish_time = postItem.post.publish_time;
            scope.postText = postItem.post.text;
            scope.time = '11:15';
            scope.date = '23 APR 1991';
            $httpBackend.expectPOST("post/" + action).respond(responsePost);
            scope.create_post(action);
            scope.$on('post_saved', function (event, data) {
                expect(data.post).toEqual({channel: [], post: postItem.post});
            });
            $httpBackend.flush();

            expect($rootScope.$broadcast).toHaveBeenCalled();
            expect(scope.sendingData.publish_to).toEqual([3, 1, 2, 23]);
        });

        it('directive: createForm (function: create_post| function: DateCooker)', function() {
            $httpBackend.flush();
            var action = 'save';
            var postItem = init.posts().results[0];
            scope.postText = postItem.post.text;
            scope.mailText = postItem.post.text;
            scope.time = '11:15';
            scope.date = '23 APR 1991';
            scope.postSubject = 'subject';
            scope.activeMailFlag = true;
            $httpBackend.expectPOST("post/" + action).respond();
            scope.create_post(action);
            $httpBackend.flush();
            expect(scope.sendingData.publish_to).toEqual([36, 37, 35]);
        });

        it('directive: createForm (function: create_post| function: DateCooker| action save for gotmail (without ids))', function() {
            $httpBackend.flush();
            var id = $rootScope.activeProject.id;
            var action = 'save';
            var postItem = init.posts().results[0];
            scope.postText = postItem.post.text;
            scope.mailText = postItem.post.text;
            scope.time = '11:15';
            scope.date = '23 APR 1991';
            scope.postSubject = 'subject';
            scope.activeMailFlag = true;
            scope.send_channel_ids = [3, 1, 2, 23];
            $httpBackend.expectPOST("post/" + action).respond();
            scope.create_post(action);
            $httpBackend.flush();
            expect(scope.sendingData.publish_to.length).toBe(1);
        });
    })

    describe('DirectiveTest: analyzeChart', function() {
        beforeEach(inject(function(){
            scope.hidingLoader = function () {};
            scope.showingLoader = function () {};
            $httpBackend.expectGET("channels/analyze?time_gap=604800").respond(init.analyzeData());
            $httpBackend.expectGET("channels/ga").respond(init.listGoogleAnalytics());
            $rootScope.$apply();
            var tpl = init.analyzeChartDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('directive: analyzeChart', function() {
            $httpBackend.flush();
            var socialProfile = init.analyzeData()['facebook'][0];
            var googleProfile1 = init.analyzeData()[scope.googleName][0];
            var googleWrapperArray = {};
            $.map(init.analyzeData()[scope.googleName], function (item, i) {
                googleWrapperArray[item.id] = item.name;
            })
            expect(scope.availableNamesGoogleAnalytics).toEqual(googleWrapperArray);
            $.map(scope.availableListGoogleAnalytics[googleProfile1.id], function(item, i) {
                expect(Object.keys(item).length).toBe(Object.keys(socialProfile).length);
                $.map(item, function(elem, key) {
                    expect(socialProfile[key]).not.toBe(undefined);
                });
            });
            expect(scope.activePeriod).toBe("7d");
            expect(Object.keys(scope.analyzeDataCustom).length).toBe(3);
            expect(Object.keys(scope.googleDataCustom).length).toBe(Object.keys(googleWrapperArray).length);
        });

        it('directive: analyzeChart(only social channels)', function() {
            $httpBackend.flush();
            $httpBackend.expectGET("channels/analyze?time_gap=604800").respond(init.analyzeDataWithoutGoogle());
            $httpBackend.expectGET("channels/ga").respond(init.listGoogleAnalytics());
            scope.initAnalyzePage();
            $httpBackend.flush();
            expect(scope.labels.length).toBe(scope.data[1].length);
            expect(scope.labels[0]).toBe('03/13');
            expect(scope.labels[1]).toBe('03/21');
            expect(scope.titleAnalyze.length).toBe(scope.data.length - 1);
            expect(scope.activePeriod).toBe("7d");
        });

        it('directive: analyzeChart (function: getCountDays)', function() {
            $httpBackend.flush();
            var countDays = scope.getCountDays();
            expect(countDays < 93 && countDays > 88).toBe(true)
        });

        it('directive: analyzeChart (function: getChart)', function() {
            $httpBackend.flush();
            $httpBackend.expectGET("channels/analyze?time_gap=604800").respond(init.analyzeDataWithoutGoogle());
            $httpBackend.expectGET("channels/ga").respond(init.listGoogleAnalytics());
            scope.initAnalyzePage();
            $httpBackend.flush();
            var linkedin = init.analyzeData().linkedin[0];
            var count = scope.wrapIndexData[linkedin.id]
            expect(scope.data[count]).toEqual([99, 0])
            scope.getChart(linkedin);
            expect(scope.data[count]).toEqual([])
        });

        it('function: getProfile', function() {
            $httpBackend.flush();
            var taskId = {"task_id": "fe7ef1bb-f877-4aaa-8e02-e027cab827cf"};
            var profile = init.analyzeData().google[0];
            $httpBackend.expectPOST("channels/ga/"+ profile.id +"/profile/" + profile.profile_id).respond(taskId);
            scope.getProfile(profile.id, profile.profile_id);
            $httpBackend.flush();

            expect(Object.keys(scope.analyzeDataCustom).length).toBe(3);
            expect(Object.keys(scope.googleDataCustom).length).toBe(2);

            $httpBackend.expectGET("channels/ga/profile/"+ profile.profile_id +"/status/" + taskId.task_id).respond({status: "SUCCESS"});
            restService.pingGoogleAnalytics(profile.profile_id, taskId.task_id);
            $httpBackend.flush();
        });
    })

    describe('DirectiveTest: listChannels', function() {
        beforeEach(inject(function(){
            $httpBackend.expectGET("channels/connect/facebook/pages/list").respond(init.fbList());
            $httpBackend.expectGET("channels?page=1").respond(init.listChannel());

            $rootScope.$apply();
            var tpl = init.listChannelsDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('directive: listChannels', function() {
            $httpBackend.flush();
            expect(scope.listChannel.length).toBe(3);
            expect(scope.curr_page).toBe(undefined);
            expect(scope.this_page).toBe(1);
            expect(scope.facebookList.length).toBe(1)

        });

        it('directive: listChannels (function: renewChannel)', function() {
            $httpBackend.flush();
            expect(scope.listChannel[2].status).toBe(8);
            $httpBackend.expectGET("channels/token_exchange/facebook/9").respond();
            scope.renewChannel(scope.listChannel[2].channel_type, scope.listChannel[2].id);
            $httpBackend.flush();
            expect(scope.listChannel[2].status).toBe(1);

            expect(scope.listChannel[0].status).toBe(8);
            $httpBackend.expectGET("channels?page=1").respond(init.listChannelSuccess());
            scope.changeStatusChannel (scope.listChannel[0].id)
            $httpBackend.flush();
            expect(scope.listChannel[0].status).toBe(1);
        });

        it('directive: listChannels (function: manageChannel)', function() {
            $httpBackend.flush();
            var channelId = 1;
            var channelName = 'gotmail';
            var data = {
                'email_list': init.activeListMails()
            }
            $httpBackend.expectGET("channels/gotmail/" + channelId).respond(data);
            $httpBackend.expectGET("views/channel/channel_item.html").respond();
            scope.manageChannel(channelId, channelName);
            $httpBackend.flush();
            expect(scope.listMails).toEqual(init.activeListMails());
            expect(scope.channelMailName).toBe(channelName);
            expect(scope.existChannelMail).toBe(true);
            expect(scope.listMailsLength).toBe(Object.keys(init.activeListMails()).length);
        });
    })

    describe('DirectiveTest: listProjects', function() {
        beforeEach(inject(function(){
            $httpBackend.expectGET("projects").respond(init.projects());
            $rootScope.$apply();
            var tpl = init.listProjectsDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('directive: listProjects', function() {
            $httpBackend.flush();
            expect(scope.selected_project.name).toBe(init.projects()[0].name);
        });

        it('directive: listProjects (function: selectProject)', function() {
            $httpBackend.flush();
            $httpBackend.expectPOST("projects/current").respond();
            scope.selectProject(init.projects()[1]);
            $httpBackend.flush();
            expect(scope.selected_project.name).toBe(init.projects()[1].name);
        });

    })

    describe('DirectiveTest: editPost', function() {
        beforeEach(inject(function($controller){
            publishCtrl = $controller('PublishController', {
                $scope: scope
            });
            popupCtrl = $controller('PopupController', {
                $scope: scope,
                $modalInstance: modalInstance,
                popupData:  {
                    confirmText: 'confirmText'
                }
            });

            scope.posts = init.listPosts().results;
            scope.showMainMessage = function (text) { return text;}
            $rootScope.$apply();
            var tpl = init.editPostDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();

            $httpBackend.expectGET("channels/available").respond(init.responseAvailableChannels());
            scope.getAvailableChannels(scope.posts[0].post.id);
            $rootScope.getCalendarTimeDate = function () {
                var data = {
                    'time': '11:15',
                    'date': '23 APR 1991'
                };
                return data;
            };
        }));

        it('function: edit_post (action: publish)', function() {
            $httpBackend.flush();
            var post = scope.posts[0];
            scope.itemPost = post.post.text;
            var action = "publish";
            spyOn($rootScope, '$broadcast').and.callThrough();
            $httpBackend.expectPOST("post/" + post.post.id + "/" + action).respond();
            scope.edit_post(post.post.id, post.post, action);
            scope.$on('post_publish', function (event, data) {
                expect(data.id).toBe(post.post.id);
            });
            $httpBackend.flush();
            expect($rootScope.$broadcast).toHaveBeenCalled();
        });

        //it('function: edit_post (action: renew)', function() {
        //    $httpBackend.flush();
        //    var post = scope.posts[0];
        //    $rootScope.activeItem = post;
        //    var action = "renew";
        //    scope.itemPost = post.post.text;
        //    $httpBackend.expectPOST("post/" + post.post.id + "/" + action).respond();
        //    scope.edit_post(post.post.id, post.post, action);
        //    $httpBackend.flush();
        //    expect(scope.flagLabel).toBe('recovery');
        //});

        it('function: edit_post (action: save)', function() {
            $httpBackend.flush();
            var post = scope.posts[0];
            $rootScope.activeItem = post;
            var action = "save";
            scope.itemPost = post.post.text;
            spyOn($rootScope, '$broadcast').and.callThrough();
            $httpBackend.expectPOST("post/" + post.post.id + "/" + action).respond();
            scope.edit_post(post.post.id, post.post, action);
            $httpBackend.flush();
            expect(scope.flagLabel).toBe('save');
        });

        it('function: cancelPost (action: cancel)', function() {
            $httpBackend.flush();
            spyOn($rootScope, '$broadcast').and.callThrough();
            var postId = scope.posts[0].post.id;
            scope.cancelPost(postId);
            $httpBackend.expectGET("/views/popup/confirm_popup.html").respond();
            $httpBackend.flush();
            $httpBackend.expectPOST("post/" + postId + "/cancel").respond();
            scope.doneCancelPost();
            scope.$on('post_publish', function (event, data) {
                expect(data.id).toBe(postId);
            });
            $httpBackend.flush();
        });

        it('function: deletePost (action: delete)', function() {
            $httpBackend.flush();
            spyOn($rootScope, '$broadcast').and.callThrough();
            var postId = scope.posts[0].post.id;
            scope.deletePost(postId);
            $httpBackend.expectGET("/views/popup/confirm_popup.html").respond();
            $httpBackend.flush();
            $httpBackend.expectDELETE("post/" + postId).respond();
            scope.doneDeletePost();
            scope.$on('post_publish', function (event, data) {
                expect(data.id).toBe(postId);
            });
            $httpBackend.flush();
        });

    })

    describe('DirectiveTest: loader', function() {
        beforeEach(inject(function() {
            $httpBackend.expectGET('/views/loader.html').respond();
            var tpl = init.loaderDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('function: showingLoader', function() {
            $httpBackend.flush();
            scope.showingLoader();
            expect(scope.showLoader).toBe(true);
            scope.hidingLoader();
            expect(scope.showLoader).toBe(false);
        });
    });

    describe('DirectiveTest: logout', function() {
        beforeEach(inject(function() {
            var tpl = init.logoutDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('function: logoutUser', function() {
            $httpBackend.flush();
            $httpBackend.expectGET('user/logout').respond();
            $httpBackend.expectGET('views/header-auth.html').respond();
            $httpBackend.expectGET('views/content-login.html').respond();
            scope.logoutUser();
            $httpBackend.flush();
        });
    });

    describe('DirectiveTest: profile', function() {
        beforeEach(inject(function($controller) {
            $httpBackend.expectGET('views/profile/content.html').respond();
            $httpBackend.expectGET('views/profile/projects.html').respond();
            $httpBackend.expectGET('projects').respond();
            $rootScope.$apply();
            popupCtrl = $controller('PopupController', {
                $scope: scope,
                $modalInstance: modalInstance,
                popupData:  {
                    popup_name: 'changeProjectName',
                    project_name: init.projects()[0].name
                }
            });
            profileCtrl = $controller('ProfileController', {
                $scope: scope
            });
            var tpl = init.profileDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
            spyOn($rootScope, '$broadcast').and.callThrough();
            $state.go('profile.list');
        }));

        it('function: addProject', function() {
            $httpBackend.flush();
            var project_name = "new_project";
            scope.addProjectForm = {"$pristine":true};
            scope.showMainMessage = function() {};
            var listener = jasmine.createSpy('listener');
            $httpBackend.expectPOST('projects').respond();

            scope.addProject(project_name);
            scope.$on('updateProject', listener);
            $httpBackend.flush();
            expect(listener).toHaveBeenCalled();
        });

        it('function: deleteProject', function() {
            $httpBackend.flush();
            var projects = angular.copy(init.projects());
            var index = 0;
            scope.showMainMessage = function() {};
            var listener = jasmine.createSpy('listener');
            $httpBackend.expectDELETE('projects/' + projects[index].id).respond();

            scope.deleteProject(projects, index);
            scope.$on('updateProject', listener);
            $httpBackend.flush();
            expect(listener).toHaveBeenCalled();
            expect(init.projects().length).toBe(projects.length + 1)
        });

        it('function: editProject', function() {
            $httpBackend.flush();
            $httpBackend.expectGET("/views/popup/change_project_name_popup.html").respond();
            var projects = angular.copy(init.projects());
            var index = 0;
            scope.editProject(projects, index);
            $httpBackend.flush();
        });

        it('function: editProject (modalInstance)', function() {
            $httpBackend.flush();
            expect(scope.popupData.popup_name).toBe('changeProjectName');
            expect(scope.popupData.project_name).toBe('twitter');
        });

        describe('DirectiveTest: loginAs', function() {
            beforeEach(inject(function() {
                var tpl = init.loginAsDirectivePart1();
                var element = $compile(tpl)(scope);
                scope.$digest();

                var tpl2 = init.loginAsDirectivePart2();
                var element2 = $compile(tpl2)(scope);
                scope.$digest();

            }));

            it('function: loginAsUser', function() {
                $httpBackend.flush();
                var id = init.businessData.user[0].id;
                $httpBackend.expectPOST('user/'+ id +'/login_as').respond();
                $httpBackend.expectGET("projects").respond(init.projects());
                scope.loginAsUser(id);
                $httpBackend.flush();
            });

            it('function: returnToMyProfile', function() {
                $httpBackend.flush();
                $httpBackend.expectPOST('user/return_my_life').respond();
                $httpBackend.expectGET("projects").respond(init.projects());
                scope.returnToMyProfile();
                $httpBackend.flush();
            });
        });

        describe('DirectiveTest: manageMail', function() {
            beforeEach(inject(function() {
                scope.activeListMails = init.activeListMails();
                var tpl = init.manageMailDirective();
                var element = $compile(tpl)(scope);
                scope.$digest();
            }));

            it('function: activationMail', function() {
                $httpBackend.flush();
                scope.activationMail('User_1@mail.com', 'User_1');
                expect(scope.flagMail).toBe(true);
                expect(Object.keys(scope.activeListMails).length).toBe(Object.keys(init.activeListMails()).length-1);
                scope.activationMail('User_1@mail.com', 'User_1');
                expect(scope.flagMail).toBe(false);
                expect(Object.keys(scope.activeListMails).length).toBe(Object.keys(init.activeListMails()).length);
            });
        });

        describe('DirectiveTest: gotMail', function() {
            beforeEach(inject(function() {
                scope.activeListMails = init.activeListMails();
                scope.listMails = init.activeListMails();
                scope.channelMailId = 1;
                var tpl = init.gotMailDirective();
                var element = $compile(tpl)(scope);
                scope.$digest();
            }));

            it('function: loadMailFile', function() {
                $httpBackend.flush();
                scope.channelMailName = 'gotMail';
                $httpBackend.expectGET('/views/popup/manage_mail_popup.html').respond();
                scope.loadMailFile();
                $httpBackend.flush();
            });

            it('function: connectGotMails', function() {
                $httpBackend.flush();
                scope.manageChannel = function () {};
                scope.showMainMessage = function () {};
                $httpBackend.expectPOST('channels/connect/gotmail').respond({'channel_id': scope.channelMailId});
                scope.connectGotMails('add');
                $httpBackend.flush();
            });

            it('function: deleteMails | confirm:false', function() {
                $httpBackend.flush();
                spyOn(window, 'confirm').and.callFake(function () {
                    return false;
                });
                scope.deleteMails();
                expect(scope.listMails).toEqual(init.activeListMails());
            });

            it('function: deleteMails | confirm:true', function() {
                $httpBackend.flush();
                scope.activeListMails = init.modListMails();
                spyOn(window, 'confirm').and.callFake(function () {
                    return true;
                });
                scope.deleteMails();
                $httpBackend.expectPUT('channels/gotmail/' + scope.channelMailId).respond();
                $httpBackend.flush();
                expect(scope.listMails).toEqual(init.modListMails());
            });
        });

    });

    describe('DirectiveTest: simditorManage', function() {
        beforeEach(inject(function(){
            $httpBackend.expectGET('/views/publish/simditor/select_templates.html').respond(init.simditorManageTransclude());
            $rootScope.$apply();
            var tpl = init.simditorManageCreateDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('directive: simditorManage', function() {
            scope.postText = 'postText';
            $httpBackend.flush();
            expect(scope.mailText).toBe(scope.postText);
        });

        it('directive: simditorManageRegExp', function() {
            scope.postText = 'some text <div>postText</div>div>';
            $httpBackend.flush();
            var resultText = scope.postText.replace(/(div>)/g, '$1 ');
            expect(scope.mailText).toBe(resultText);
        });
    });


    describe('DirectiveTest: changePassword', function() {
        beforeEach(inject(function(){
            $rootScope.$apply();
            var tpl = init.changePasswordDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
            scope.showMainMessage = function (text) {return text;};
        }));

        it('directive: changePassword (function: changePassword)', function() {
            $httpBackend.flush();
            $state.params.code = '85ae3d9c-455a-4b98-a0fb-a06f98201bc9';
            $httpBackend.expectPOST('user/password/restore/confirm/' + $state.params.code).respond();
            var password1 = 'password', password2 = 'password';
            scope.changePassword(password1, password2);
            $httpBackend.expectGET('views/header-auth.html').respond();
            $httpBackend.expectGET('views/content-login.html').respond();
            $httpBackend.flush();
            expect(scope.passwordValidation).toBe(false);
        });

        it('directive: changePassword (function: changePassword(different password))', function() {
            $httpBackend.flush();
            var password1 = 'password', password2 = 'password1';
            scope.changePassword(password1, password2);
            expect(scope.passwordValidation).toBe(true);
        });

        it('directive: changePassword (function: changePassword(without code))', function() {
            $httpBackend.flush();
            $state.params.code = '';
            var password1 = 'password', password2 = 'password';
            scope.changePassword(password1, password2);
            expect(scope.passwordValidation).toBe(true);
        });
    });

    describe('DirectiveTest: forgotPassword', function() {
        beforeEach(inject(function(){
            $rootScope.$apply();
            var tpl = init.forgotPasswordDirective();
            var element = $compile(tpl)(scope);
            scope.$digest();
        }));

        it('directive: forgotPassword (function: forgotPassword)', function() {
            $httpBackend.flush();
            $httpBackend.expectGET('/views/popup/password_reset.html').respond();
            scope.forgotPassword();
            $httpBackend.flush();
        });

        it('directive: forgotPassword (function: sendEmail)', function() {
            $httpBackend.flush();
            var accountName = 'accountName';
            $httpBackend.expectPOST('user/password/restore/request').respond();
            scope.sendEmail(accountName);
            $httpBackend.flush();
            expect(scope.passwordValidation).toBe(false);
        });

        it('directive: forgotPassword (function: sendEmail(invalid accountName))', function() {
            $httpBackend.flush();
            scope.sendEmail(undefined);
            expect(scope.passwordValidation).toBe(true);
            var accountName = '';
            scope.sendEmail(accountName);
            expect(scope.passwordValidation).toBe(true);
        });

    });

    describe('DirectivesTest: countrySelect', function() {
        function create(template) {
            var elem, compiledElem;
            elem = angular.element(template);
            compiledElem = $compile(elem)(scope);
            scope.$digest();

            return compiledElem;
        }
        beforeEach(inject(function () {
            $httpBackend.expectGET('/views/select_boxes/country.html').respond();
            $httpBackend.expectGET('user/country').respond(init.countriesList);
            $httpBackend.expectGET('user/country').respond(init.countriesList);
            var templateCountry = init.countrySelectDirective();
            var templateUser = init.countrySelectUserDirective();
            scope.el = create(templateCountry);
            scope.elUser = create(templateUser);
        }));

        it('directive: countrySelect', function() {
            $httpBackend.flush();
            expect(scope.el.isolateScope().countriesList.length).toBe(init.countriesList.length);
            expect(scope.el.isolateScope().formName).toBe('company');
        });

        it('directive: changeCountry', function() {
            $httpBackend.flush();
            scope.el.isolateScope().newCompanyObj = {};
            var chooseCountry = init.countriesList[0];
            scope.el.isolateScope().changeCountry(scope.el.isolateScope().formName, chooseCountry);
            expect(scope.el.isolateScope().newCompanyObj.country).toBe(chooseCountry.name.id);

        });

        it('directive: changeCountry (for type: "user")', function() {
            $httpBackend.flush();
            var chooseCountry = init.countriesList[0];
            expect(scope.elUser.isolateScope().formName).toBe('user');
            scope.elUser.isolateScope().changeCountry(scope.elUser.isolateScope().formName, chooseCountry);
            scope.elUser.isolateScope().createFormData = {};
            expect(scope.elUser.isolateScope().createFormData.country).toBe(chooseCountry.name.id);
        });

    });

    describe('DirectiveTest: industrySelect', function() {
        beforeEach(inject(function () {
            $httpBackend.expectGET('/views/select_boxes/industry.html').respond();
            $rootScope.$apply();

            var templateIndustry = init.industrySelectDirective();
            var element = $compile(templateIndustry)(scope);
            scope.$digest();
        }));

        it('directive: industrySelect (function: getIndustryList)', function() {
            $httpBackend.flush();
            scope.newCompanyObj = {};
            var itemCountry = init.countriesList[0];
            var itemIndustry = init.industryList[0];

            $httpBackend.expectGET('user/country/' + itemCountry.id + '/industry').respond([itemIndustry]);
//            spyOn($rootScope, '$broadcast').and.callThrough();
            scope.getIndustryList(itemCountry.id);
            expect(scope.industriesList.length)
            $httpBackend.flush();
            expect(scope.industriesList.length).toBe([itemIndustry].length);
            expect(scope.selectedIndustry).toBe(false);
            expect(scope.newCompanyObj.industry).toBe(undefined);
        });

        it('directive: industrySelect (watch SelectIndustry)', function() {
            $httpBackend.flush();
            scope.newCompanyObj = {};
            var itemCountry = init.countriesList[0];
            var itemIndustry = init.industryList[0];

            $httpBackend.expectGET('user/country/' + itemCountry.id + '/industry').respond([itemIndustry]);
            scope.getIndustryList(itemCountry.id);
            expect(scope.industriesList.length);
            scope.selectedIndustry = itemIndustry;
            $httpBackend.flush();
            expect(scope.newCompanyObj.industry).toBe(itemIndustry.id);

        });
    });

    describe('DirectiveTest: staffCountSelect', function() {
        beforeEach(inject(function () {
            $httpBackend.expectGET('/views/select_boxes/staff.html').respond();
            $rootScope.$apply();

            var tplStaff = init.staffSelectDirective();
            var element = $compile(tplStaff)(scope);
            scope.$digest();
        }));

        it('directive: staffCountSelect', function() {
            scope.newCompanyObj = {};
            expect(scope.newCompanyObj.staff_count).toBe(undefined);
            scope.newCompanyObj.staff_count = init.staffsCountList[0];
            $httpBackend.flush();
            expect(scope.staffsCountList).toEqual(init.staffsCountList);
            scope.selectedStaffCount = init.staffsCountList[1];
            $rootScope.$apply();
            expect(scope.newCompanyObj.staff_count).toBe(init.staffsCountList[1].id);
        });
    });

    describe('DirectiveTest: addNewCompany', function() {
        beforeEach(inject(function () {
//            $httpBackend.expectGET('/views/select_boxes/staff.html').respond();
            $rootScope.$apply();

            var tplStaff = init.addNewCompanyDirective();
            var element = $compile(tplStaff)(scope);
            scope.$digest();
            scope.showMainMessage = function () {};
        }));

        it('directive: addNewCompany', function() {
            $httpBackend.flush();
            expect(scope.submittedCompany).toBe(false);
            expect(scope.newCompanyObj).toEqual({});
            expect(scope.maxId).toBe(50);
        });

        it('directive: addNewCompany (function: toggleAddCompanyForm)', function() {
            $httpBackend.flush();
            var companyName = 'companyName';
            scope.toggleAddCompanyForm(false, companyName);
            expect(scope.companySubmit).toBe(undefined);
            scope.toggleAddCompanyForm(true, companyName);
            expect(scope.showCreateCompanyForm).toBe(true);
            expect(scope.companySubmit).toBe(false);
            scope.toggleAddCompanyForm(true, '');
            expect(scope.companySubmit).toBe(true);
            scope.toggleAddCompanyForm(true, undefined);
            expect(scope.companySubmit).toBe(true);
        });

        it('directive: addNewCompany (function: addCompany: min params)', function() {
            $httpBackend.flush();
            scope.newCompanyObj = init.newCompanyRequestObjMin;
            scope.addCompanyForm = {
                $valid: true
            };
            scope.company = init.newCountryName;
            scope.companyList = [];
            $httpBackend.expectPOST('user/company').respond(init.newCompanyResponseObjMin);
            scope.addCompany();
            expect(scope.newCompanyObj.name).toBe(scope.company);
            $httpBackend.flush();
            expect(scope.submittedCompany).toBe(false);
            expect(scope.companyList.length).toBe(1);
            expect(scope.showCreateCompanyForm).toBe(false);
            expect(scope.newCompanyObj).toEqual({});
        });

        it('directive: addNewCompany (function: addCompany: all params)', function() {
            $httpBackend.flush();
            scope.newCompanyObj = init.newCompanyRequestObj;
            scope.addCompanyForm = {
                $valid: true
            };
            scope.company = init.newCountryName;
            scope.companyList = [];
            $httpBackend.expectPOST('user/company').respond(init.newCompanyResponseObj);
            scope.addCompany();
            expect(scope.newCompanyObj.name).toBe(scope.company);
            $httpBackend.flush();
            expect(scope.submittedCompany).toBe(false);
            expect(scope.companyList.length).toBe(1);
            expect(scope.showCreateCompanyForm).toBe(false);
            expect(scope.newCompanyObj).toEqual({});
        });

        it('directive: addNewCompany (function: addCompany (do not choose industry))', function() {
            $httpBackend.flush();
            scope.newCompanyObj = init.newCompanyRequestObjMin;
            scope.newCompanyObj.industry = undefined;
            scope.addCompanyForm = {
                $valid: true
            };
            scope.company = init.newCountryName;
            scope.companyList = [];
            $httpBackend.expectPOST('user/company').respond(init.newCompanyResponseObjMin);
            scope.addCompany();
            expect(Object.keys(scope.newCompanyObj).length).toBe(Object.keys(init.newCompanyRequestObjMin).length);
            $httpBackend.flush();
        });
    });

});
