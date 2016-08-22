

describe('CommentController', function () {
        var scope, rootScope, compile, routeParams, fscope, frootScope, controller, http, httpbackend, $popupManager, $timeout1, init, $uploadManager, timerCallback, $commentsManager;
        beforeEach(module('NotesApp'));
        beforeEach(module('ui.tinymce'));
        beforeEach(function() {
            jasmine.Clock.useMock();
        });
        beforeEach(
            inject(function($rootScope, _$compile_, $templateCache, $controller, $routeParams, $httpBackend, $http, popupManager, $timeout, uploadManager, commentsManager) {
                rootScope = $rootScope;
                scope = $rootScope.$new();
                fscope = $rootScope.$new();
                frootScope = $rootScope.$new();
                compile = _$compile_;
                $uploadManager = uploadManager;
                routeParams = $routeParams;
                controller = $controller;
                http = $http;
                httpbackend = $httpBackend;
                $popupManager = popupManager;
                $timeout1 = $timeout;
                $commentsManager = commentsManager;
                init = new InitialDataForUnitTests();
                var notes_list =  {"data": [
                    {"type": "note", "id": "524abbb2ca573a60b7b0023a"}
                ], "success": true}
            var data = {"action": "notes:tags", "body": {"last_update_time": 0}, "loading": true};
            var tagObject = {"errorCode":0, "body": {"last_update_time": 1384433083, "tags":[12232, 'wew']}};
            $httpBackend.when('POST', '/client/notes/action/', data).respond(tagObject);
        var directiveTemplate = '<ul upload=""</ul>';
            $templateCache.put("/client/static/tpl/attaches_list.html", directiveTemplate);
            })
        );
        afterEach(function () {
            httpbackend.verifyNoOutstandingExpectation();
            httpbackend.verifyNoOutstandingRequest();
        });

        it('check commentsManager', function(){
            $.jStorage = [];
            $.jStorage.get = function() {
            }
            var data = {
                "action": "team:note",
                "body": {
                    "note": {
                        "parent_id": "root"
                    }
                },
                "loading": true
            };
            httpbackend.when('POST', '/client/team/action/', data).respond(init.getResponsedData());
            var data = {action: 'notes:get', body: {parent_id: 'root'}, loading: true}
            httpbackend.when('POST', '/client/notes/action/', data).respond(init.getResponsedData());
            controller('TeamController', { $scope: scope,
                                            $rootScope: rootScope,
                                            $routeParams: routeParams,
                                            $http: http,
                                            popupManager: $popupManager,
                                            $document: document,
                                            commentsManager: $commentsManager});
            httpbackend.when('GET', '/client/settings/jsonp_server_url').respond(init.getJsonObject());
            httpbackend.flush();
            scope.initController();
            scope.noteItem = init.getNoteObject();

            var count = 0;
            var offset = 0;
            var note_id = scope.noteItem.global_id;
            var originText = "text that comment";
            var originId = "1,2";
            var getData = {
                'action': 'team:comments',
                'body': {
                    'get_all': {
                        "note": note_id,
                        "count": count,
                        "offset": offset
                    }
                }
            }
            var getResponse = init.getResponseComment();
            httpbackend.when('POST', "/client/team/action", getData).respond(getResponse);
            $commentsManager.getComments(note_id, offset, count)
            httpbackend.flush();

            var start_position = 1;
            var length = 1;
            var text = "selection text";
            var addData = {
                'action': 'team:comments',
                'body': {
                    'add': {
                        "note": note_id,
                        "start_position": start_position,
                        "length": length,
                        "text": text
                    }
                }
            }
            var responseData = {
                "body": {
                    "comment": {
                        "comment_id": 2
                    },
                    "success":true
                },
                "errorCode": 0
            }
            httpbackend.when('POST', "/client/team/action", addData).respond(responseData);
            $commentsManager.addComments(note_id, start_position, length, text)
            httpbackend.flush();

            var position = 1;
            var lengthNewText = 1;
            var id = "1";
            var edit_text = "edit";
            spyOn(window, "prompt").andReturn("edit")
            var editData = {
                'action': 'team:comments',
                'body': {
                    'edit': {
                        "start_position": position,
                        "length": lengthNewText,
                        "text": edit_text,
                        "comment_id": id
                    }
                }
            }
            httpbackend.when('POST', "/client/team/action", editData).respond({"errorCode": 0, "body": {"success": true}});
            $commentsManager.editComments(position, lengthNewText, edit_text, id)
            httpbackend.flush();

            var delData = {
                'action': 'team:comments',
                'body': {
                    'delete': {
                        "comment_id": id
                    }
                }
            }
            httpbackend.when('POST', "/client/team/action", delData).respond({"errorCode": 0, "body": {"success": true}});
            $commentsManager.delComments(id);
            httpbackend.flush();

            scope.getDataComment([1, 2], originText, originId);
            httpbackend.flush();
            expect(scope.objToPopup[1]).toBe(originText);
            expect(scope.objToPopup[2]).toBe(originId)
            expect(scope.objToPopup[0][0].text).toBe(getResponse.body.comments[0].text)
            expect(scope.objToPopup[0][1].id).toBe(getResponse.body.comments[1].id)

            scope.TINYMCE_N = new Object();
            scope.TINYMCE_N.getContent = function(string){
                return init.getTinymceContent();
            }
            scope.notesList = init.getNotesListObject();
            var data = {"action": "notes:get", "body": {"parent_id": 'miZyv5KRMsfTl4zi'}, "loading": true};
            httpbackend.when('POST', '/client/notes/action/', init.getDataForUpdate(scope.noteItem) ).
                                                                            respond(init.getResponsedData());

            httpbackend.when('POST', '/client/notes/action/', data ).respond(init.getResponsedData());

            httpbackend.when('POST', '/client/quota/check_user_quota_limit',
                            {"note_text_size": 97, "global_id": scope.noteItem.global_id})
                            .respond(init.getResponsedQuotaPermit());
            var data1 = {
                'action': 'team:update',
                'body': {
                    'store': {
                        'notes': [scope.noteItem]
                    }
                },
                "loading": true,
                "process": "saveNote",
                "element": '#save_change_main'
            }
            var responseNote = {
                        "body":{
                            "notes":[{
                                "global_id": 1
                            }]
                        }
                }


            httpbackend.when('POST', '/client/team/action/', data1, function(headers) {
            return headers['Content-Type'] === 'application/json;charset=UTF-8';} ).respond(responseNote);
            var dataNote = {"action": "team:note", "body":  {'note':  {"parent_id": 'miZyv5KRMsfTl4zi'}}, "loading": true};
            httpbackend.when('POST', '/client/team/action/', dataNote).respond(responseNote);
            scope.editComment('1');
            httpbackend.flush();

            window.tinymce = init.tinymce();
            httpbackend.when('POST', '/client/quota/check_user_quota_limit',
                            {"note_text_size": 97, "global_id": scope.noteItem.global_id})
                            .respond(init.getResponsedQuotaPermit());

            scope.saveNoteData = function(){};
            scope.idComment = scope.objToPopup[2];
            scope.allComment = scope.objToPopup[0];
            scope.deleteComment('1');
            httpbackend.flush();
            expect(scope.idComment).toBe('2');
            rootScope.isEqual(scope.allComment, [{id: 2, text: 'text comment 2'}]);

            var objElem = init.tinymce_target();
            var ids = ["5", "1"]
            var delData = {
                'action': 'team:comments',
                'body': {
                    'delete': {
                        "comment_id": ids[0]
                    }
                }
            }
            httpbackend.when('POST', "/client/team/action", delData).respond({"errorCode": 0, "body": {"success": true}});
            $commentsManager.delComments(ids[0]);
            httpbackend.flush();
        })
})