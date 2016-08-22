describe('Unit testing great quotes', function() {
    var $compile;
    var $rootScope;
    var httpbackend;
    var $scope;
    var http;
    var $commentsManager;
    var $passwordManager;

    beforeEach(module('NotesApp'));

    beforeEach(inject(function(_$compile_, _$rootScope_, $httpBackend, $http,
                               $templateCache, passwordManager, commentsManager){
          $compile = _$compile_;
          $rootScope = _$rootScope_;
          httpbackend = $httpBackend;
          $scope = $rootScope.$new();
          http = $http;
          $commentsManager = commentsManager;
          $passwordManager = passwordManager


        var directiveTemplate = '<ul class="attaches_list" ng-show ="attachesListShow" ng-mouseleave="attachesListHide()"><li ng-repeat="attach in noteItem.attachements | attachesWithImagesFilesFilter" id="<[attach.global_id]>" class="attach_item" {#ng-click="pasteAttach(attach)"#} ng-mouseenter="auxiliaryMenuShow(attach.global_id)" ng-mouseleave="auxiliaryMenuHide(attach.global_id)">'
            +'<img ng-bind="prepareAttachesList(attach)" class="icons_of_attachments_types" attach-icon-location="attach.type"/>'
            +'<div class="attachments_names"><[attachName]></div>'
            +'<div ng-click="deleteAttach(attach)" ng-show="false" class="auxiliary_menu">delete</div>'
            +'</li>'
            +'</ul>';
            $templateCache.put("/client/static/tpl/attaches_list.html", directiveTemplate);

        var directiveTempl = '<div ng-show="showInvitePopup" modal="showInvitePopup" close="close()" options="opts">'
            +'<div class="inviteleft"><textarea ng-model="prepareEmails" ></textarea>'
            +'<button ng-click="sendEmails()">Send email</button></div>'
            +'<div class="inviteright"><ul><li ng-click="replaceEmail(email)" ng-model="email" ng-repeat="email in usersEmail"><[email]></li></ul></div>'
            +'<div class="modal-footer"><a class="<[linkClass]>" href="<[linkUrl]>"><[linkName]></a>'
            +'<button ng-repeat="button in btns" id="<[button.id]>" class="<[button.cssClass]>" ng-click="clickHandler(button)"><[button.label]></button>'
            +'</div></div>';

            $templateCache.put("/client/static/tpl/invite_popup.html", directiveTempl);

        var introdusedEmailsList = '<ul class="introdused_emails">' +
            '<li ng-repeat="item in introdusedEmails" remove-button>' +
            '<p><[item.email]></p>' +
            '<span class="delete_attach_btn" ng-click="removeEmail(item)" ng-show="false"></span>' +
            '</li>' +
            '</ul>';

            $templateCache.put("/client/static/tpl/introdused_emails_list.html", introdusedEmailsList);

        var directiveComment = '<div ng-show="showCommentPopup" modal="showCommentPopup" close="close()" options="opts">'
            +'<p class="text_comment">All comments for "<span><[textComment]></span>"</p>'
            +'<ul class="list_comment">'
            +'<li ng-repeat="comment in allComment" data-id-comment="<[comment.id]>" class=\'all_comment\'><span class="comment_text_in_popup"><[comment.text]></span><span ng-show=\'showEditComment\' data-edit=\'comment_edit\' ng-click=\'editComment(comment.id)\'></span><span ng-show=\'showDeleteComment\' data-delete=\'comment_delete\' ng-click=\'deleteComment(comment.id)\'></span></li>'
            +'</ul>'
            +'<div class="modal-footer"><button class="btn blue" ng-click="addComment(idComment)" ng-show="showAddComment">Add new comment</button></div>'
            +'</div></div>';

            $templateCache.put("/client/static/tpl/comment_popup.html", directiveComment);

        var directiveCommentInEditor = '<div><button class="btn grey attache edit_mode comment" ng-click="commentNote()">Comments</button></div>';
            $templateCache.put("/client/static/tpl/comments.html", directiveCommentInEditor);

        var directivePassword = '<div ng-controller="PopupController"><div ng-show="showPasswordPopup" modal="showPasswordPopup" close="close()" options="opts">'
            +'<p class="title_password">Shared Link:<span class="remove_select" ng-click="closePopupPassword()"></span></p><form class="form_password"><p class="share_url">'
            +'<input class="url_password" type="text" ng-model="urlSharedNote" ng-readonly="true" ><span class="short_url_password" title="Short Url" ng-click="showShortUrl()"><span id="short_url" class="short_url"></span></span></p>'
            +'<span class="title_set_password">Set password:</span><div class="squaredThree"><input type="checkbox" id="squaredThree" ng-checked="isPassword" ng-click="changeStatusPassw()"/><label for="squaredThree"></label>'
            +'</div><input class="password" type="password" ng-model="passwordForNote" ng-disabled="isPassw" ><span class="under_password">Enter from 1-12 digits</span>'
            +'<button class="btn blue" ng-click="savePasswordForNote(passwordForNote)">Ok</button><button class="btn mce-blue" ng-click="unshareNote()">Unshare</button>'
            +'</form></div></div>';
        $templateCache.put("/client/static/tpl/password_popup.html", directivePassword);

        var directiveAddComment = '<div class="modal-footer" ng-class="exceptAddCommentForm" ng-show = "showAddCommentForm || showCommentPopup">' +
            '<span class="upparov_up"></span>' +
            '<input class="add_comment" placeholder="Leave comment" type="text" ng-model="newComment"/>' +
            '<div ng-hide="showEditCommentForm">' +
            '<button  class="btn green"  ng-click="checkAction(showAddCommentForm)">Comment</button>' +
            '<span class="adding_upparov_down"></span>' +
            '</div>' +
            '<div ng-show="showEditCommentForm">' +
            '<button  class="btn green"  ng-click="editComment()">Save</button>' +
            '<a class="close-edit" ng-click="closeEditCommentPopup()">Cansel</a>' +
            '<span class="adding_upparov_down"></span>' +
            '</div>' +
            '</div>';

        var comment_popup = '<div ng-controller="PopupController">' +
            '<div ng-show="showCommentPopup" modal="showCommentPopup" options="{backdrop: false, dialogClass: "comment_popup"}">' +

            '<span  class="upparov_up"></span>' +
            '<div class="popup_header" >' +
            '<img id="comment_icon"/>' +
            '<p><[commentsPopupTittle]></p>' +
            '<p class="close_comment_popup" ng-click="closePopup()">Close</p>' +
            '</div>' +
            '<ul class="list_comment" id="comment_scroll">' +
        '<li ng-repeat="comment in allComment" ng-repeat-finish data-id-comment="<[comment.id]>" class="all_comment">' +
            '<div class="comment_title">' +
            '<div class="comment_name"><[comment.user_email]></div>' +
                '<span ng-show="showEditComment" data-edit="comment_edit" ng-click="editComment(comment.id)"></span>' +
        '<span ng-show="showDeleteComment" data-delete="comment_delete" ng-click="deleteComment(comment.id)"></span>' +
            '<div class="comment_time"><[comment.time]></div>'
                +'</div>' +
                '<div class="comment_text_in_popup"><[comment.text]></div>' +
                ' </li>' +
                '</ul>' +
                '<add-comment></add-comment>' +
                '<span class="upparov_down"></span>' +
                '</div>' +
            '</div>';
        $templateCache.put("/client/static/tpl/add_comment.html", directiveAddComment);
        $templateCache.put("/client/static/tpl/comment_popup.html", comment_popup);

    }));
     beforeEach(inject(function($injector) {
         // Set up the mock http service responses
         httpbackend = $injector.get('$httpBackend');
         // backend definition common for all tests
         httpbackend.when('POST', '/client/team/action').respond({
            "body": {
                "comment": {
                    "comment_id": 2
                },
                "success":true
            },
            "errorCode": 0
        });

         // Get hold of a scope (i.e. the root scope)
         $rootScope = $injector.get('$rootScope');
         // The $controller service is used to create instances of controllers
         var $controller = $injector.get('$controller');

         createController = function() {
           return $controller('TeamController', {'$scope' : $rootScope });
         };
       }));

    it('Replaces the element with the appropriate content', function() {


        var element = $compile("<attaches-list> </attaches-list>")($rootScope);
        $rootScope.$digest();
        expect(element.html()).toContain('<!-- ngRepeat: attach in noteItem.attachements | attachesWithImagesFilesFilter -->');
    });
    
    it('Testing invite directive', function(){
        var element = $compile("<invite-popup> </invite-popup>")($rootScope);
        $rootScope.$digest();
        $rootScope.lastSelectedElement = {
            0: {
                id: "default"
            }
        }
        expect(element.html()).toContain('<!-- ngRepeat: email in usersEmail -->');
        expect(element.html()).toContain('ng-click="sendEmails()"');
        $rootScope.emailss = [];
        $rootScope.note_id = "default";
        var testEmails = ['gldk', 'fjd @vjf.tuuuf', '    fjdvjf.tuuuf', '@_._', '1@1@.ru', 'some@some.some'];
        for (var i in testEmails){
            $rootScope.prepareEmails = testEmails[i];
            $rootScope.usersEmail = $rootScope.allSendEmail;
                        var data = {
                "action": "team:invite",
                    "body": {
                        "send": {
                            "email" : $rootScope.prepareEmails,
                            "note" : $rootScope.note_id
                        }
                    }
                }
            var postdata = {
                "body": {
                    "invite":1,
                    "success":true
                },
                "errorCode": 0
            }
            httpbackend.when('POST', '/client/team/action', data).respond(postdata);
            element.find('.inviteleft button').click();
            var sendText = element.find('.inviteright ul li:first-child').text();
            expect('').toBe($rootScope.allSendEmail.join())
        }
        var textTest = ["123,", "123", "   ,   ", "   ,,,,,,,,,     ", "123   ,, ,,  ,,, , ,     "];
        var resultTest = ['123, some@some.some', '123, some@some.some', 'some@some.some', 'some@some.some', '123, some@some.some']
        for (var j = 0; j<textTest.length ;j++){
            $rootScope.prepareEmails = textTest[j];
            var testEmails1 = 'some@some.some';
            var result = $rootScope.replaceEmail(testEmails1);
            expect(resultTest[j]).toBe(result);
        }
    })

     it('Testing comment directive', function(){
         httpbackend.verifyNoOutstandingExpectation();
         httpbackend.verifyNoOutstandingRequest();
         var element = $compile("<comment-popup> </comment-popup>")($rootScope);
         $rootScope.$digest();
         expect(element.html()).toContain('<!-- ngRepeat: comment in allComment -->');
         $rootScope.noteItem = {
             "global_id": "global_id"
         }
         var note_id = $rootScope.noteItem.global_id;
         var start_position = 1;
         var length = 1;
         var text = "new comment";
         spyOn(window, "prompt").andReturn("new comment")
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
         $rootScope.idComment = "1";
         $rootScope.allComment = [{"id": "1", "text": "first text"}]
         $rootScope.saveNoteData = function(){}
         httpbackend.when('POST', "/client/team/action", addData);
         $rootScope.addComment("2");
         expect($rootScope.allComment).toEqual([{id: '1', text: 'first text', $$hashKey: '00C'}, {id: 2, text: 'new comment', $$hashKey: '00E'}]);
         expect($rootScope.idComment).toEqual('1,2');
     })

    it("Test comments in Editor", function(){
        var element = $compile("<comments></comments>")($rootScope);
        var element = $compile("<comment-popup></comment-popup>")($rootScope);
        var element1 = $compile("<add-comment></add-comment>")($rootScope);
        $rootScope.$digest();
        $rootScope.noteItem = {
             "global_id": "global_id"
         }
        var start_position = 0;
        var textComment = "text_in_editor";
//        spyOn(window, "prompt").andReturn("text_in_editor");
        $scope.newComment = "text_in_editor";
        $scope.checkAction(true);
        var addData = {
            'action': 'team:comments',
            'body': {
                'add': {
                    "note": $rootScope.noteItem.global_id,
                    "start_position": start_position,
                    "length": 69,
                    "text": textComment
                }
            }
        }
         $rootScope.idComment = "1";
         $rootScope.allComment = [{"id": "1", "text": "first text"}]
         $rootScope.saveNoteData = function(){}
         httpbackend.when('POST', "/client/team/action", addData);
         $rootScope.commentNote();
         expect($rootScope.selectionText).toEqual('<em data-id="commentId" data-class="comment_text" data-part="0">text_in_editor</em>');
    })

    it('Testing password directive', function() {
        var element = $compile("<password-popup> </password-popup>")($rootScope);
        $rootScope.$digest();
        var data = {
            "errorCode": 0,
            "body":{
               "notes_shared": [
                    {
                        id: "/client/notes/share/2789/mPXhDnchSUU819qelemeqrlMVlwppwsw"
                    }
                ]
            }

        };

        var url = "http://notes.everhelper.me/client/notes/share/2789/mPXhDnchSUU819qelemeqrlMVlwppwsw";
        var id = "miZyv5KRMsfTl4zi";
        $rootScope.shortUrl = false;
        $rootScope.objPassword = [{
            'url':url,
            'id':id,
            'data':data
        }];

        var data = {
            "url": url
        }
        var proxyResponse = {
            "short_url": "short_url",
            "errorCode": 0
        }
        httpbackend.when('POST', 'proxy/short', data).respond(proxyResponse);
        httpbackend.when('POST', '/client/notes/action', data).respond({});
        $rootScope.showShortUrl();
        httpbackend.flush();

        expect($rootScope.urlSharedNote).toBe("short_url");
        expect($rootScope.shortUrl).toBe(true);

        $rootScope.showShortUrl();
        expect($rootScope.urlSharedNote).toBe(url);
        expect($rootScope.shortUrl).toBe(false);

        $rootScope.closePopupPassword();

        expect($rootScope.passwordForNote).toBe("");

        var password = "password";
        var setData = {
                "action" : "notes:share",
                "body" : {
                    "set_password" :  {
                        "note" : id,
                        "password": password
                    }
                }
            }
        httpbackend.when('POST', '/client/notes/action', setData).respond({});
        $rootScope.savePasswordForNote(password);
        httpbackend.flush();

        $rootScope.isPassword = true;

        var getData = {
            "action" : "notes:share",
            "body" : {
                "get_password" :  {
                    "note" : id
                }
            }
        }

        var getResponse = {
            "errorCode": 0,
            "body":{
                "password": password
            }
        }
        var resetData = {
            "action" : "notes:share",
            "body" : {
                "reset_password" :  {
                    "note" : id
                }
            }
        }
        $rootScope.passwordForNote = "old_password";
        httpbackend.when('POST', '/client/notes/action', getData).respond(getResponse);
        httpbackend.when('POST', '/client/notes/action', resetData).respond(getResponse);
        $rootScope.changeStatusPassw()
        httpbackend.flush();
        expect($rootScope.passwordForNote).toBe("")
        expect($rootScope.resetPassword).toBe(true);
        expect($rootScope.isPassw).toBe(true);
        expect($rootScope.isPassword).toBe(false);
    })
});
