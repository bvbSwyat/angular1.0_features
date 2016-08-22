
NgApp.config(['$translateProvider', function ($translateProvider) {
    'use strict';
    $translateProvider.useStaticFilesLoader({
        prefix: '/json/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en-us');

}]);

/**
 * Created by swyat on 24.04.15.
 */

angular.module('adminApp')
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q, notification) {
            return {
                request: function (config) {
                    if (angular.isUndefined(config.params)) {
                        config.url = config.url.replace(/\&/gi, "/");
                    }
                    return config;
                },
                'responseError': function (rejection) {
                    if (rejection.status == 404 && $('h1[table-name]').text().length > 0) {
                        notification.log(angular.isUndefined(rejection.data.errors)
                            ? "Can't find this table entity"
                            : angular.isArray(rejection.data.errors)
                                ? rejection.data.errors.join('</br>')
                                : rejection.data.errors
                            , {addnCls: 'humane-flatty-error'});
                        rejection.status = 200;
                    }
                    return $q.reject(rejection);
                }
            }
        });
    }])

    .config(['RestangularProvider', 'AppConfigProvider', function (RestangularProvider, AppConfigProvider) {

        RestangularProvider.setEncodeIds(false);

        function getTableName(data, operation, model, response) {
            AppConfigProvider.defaults.currentTable = model.replace(/\_/gi, " ");
        }

        function getDistrictsList(data, operation, model, response) {
            AppConfigProvider.defaults.districts = angular.isUndefined(AppConfigProvider.defaults.districts)
                ? []
                : AppConfigProvider.defaults.districts;
            if (model == 'district_md') {
                if (angular.isDefined(data.result.districtcode)) {
                        if (AppConfigProvider.defaults.districts.indexOf(data.result.districtcode) == -1) {
                            AppConfigProvider.defaults.districts.push(data.result.districtcode);
                        }
                } else if (operation == 'getList' && angular.isArray(data.result)) {
                    angular.forEach(data.result, function(district) {
                        if (AppConfigProvider.defaults.districts.indexOf(district.districtcode) == -1) {
                            AppConfigProvider.defaults.districts.push(district.districtcode);
                        }
                    })
                }
            }
        }

        var processAPIResponse = function (data, operation, model) {

            var getPkFieldsForModel = function (model) {

                //this is our main entity config

                var pks = {
                    'district_md': ['districtcode'],
                    'attendance': ['logid'],
                    'district_tgt': ['districtcode', 'effectfmdt'],
                    'district_stg': ['districtcode', 'action'],
                    'district_student_stg': ['districtcode', 'studentid','action'],
                    'district_student_tgt': ['districtcode', 'studentid','effectfmdt'],
                    'batch': ['batchid'],
                    'batch_type': ['batchtypecode'],
                    'batch_params': ['districtcode', 'schoolcode', 'paramkey', 'batchtypecode'],
                    'school_tgt': ['districtcode', 'schoolcode', 'effectfmdt'],
                    'roster_hdr_src': ['hdrid'],
                    'roster_dtl_src': ['dtlid'],
                    'roster_src': ['hdrid'],
                    'csv_roster_src': ['hdrid'],
                    'school_student_stg': ['districtcode', 'schoolcode', 'studentid', 'action'],
                    'school_student_tgt': ['districtcode', 'schoolcode', 'studentid', 'effectfmdt'],
                    'school_teacher_tgt': ['districtcode', 'schoolcode', 'teachercode', 'effectfmdt'],
                    'school_teacher_stg': ['districtcode', 'schoolcode', 'teachercode', 'action'],
                    'school_stg': ['districtcode', 'schoolcode', 'action'],
                    'school_md': ['districtcode','schoolcode'],
                    'school_mp_stg': ['districtcode', 'schoolcode', 'schoolmp', 'schoolyear', 'action'],
                    'school_mp_tgt': ['districtcode', 'schoolcode', 'schoolmp', 'schoolyear', 'effectfmdt'],
                    'school_gp_stg': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'action'],
                    'school_gp_tgt': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'effectfmdt'],
                    'school_gp_class_mp_stg': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'classid', 'schoolmp', 'action'],
                    'school_gp_class_mp_tgt': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'classid', 'schoolmp', 'effectfmdt'],
                    'school_gp_class_stg': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'classid', 'action'],
                    'school_gp_class_tgt': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'classid', 'effectfmdt'],
                    'school_student_gp_stg': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'studentid','action'],
                    'school_student_gp_tgt': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'studentid','effectfmdt'],
                    'school_comments_stg': ['districtcode', 'schoolcode', 'commentcode', 'action'],
                    'school_comments_tgt': ['districtcode', 'schoolcode', 'commentcode', 'effectfmdt'],
                    'school_attendance_stg': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'classid', 'studentcode', 'attendancedate', 'mark', 'action'],
                    'user_register_stg': ['districtcode', 'subdistrictcode', 'schoolcode', 'usercode', 'engradeusertype', 'action'],
                    'user_register_tgt': ['districtcode', 'subdistrictcode', 'schoolcode', 'usercode', 'engradeusertype', 'effectfmdt'],
                    'school_gp_process_tgt': ['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'processcode', 'effectfmdt'],
                    'school_gp_class_student_tgt':['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'classid', 'studentid', 'effectfmdt'],
                    'school_gp_class_teacher_tgt':['districtcode', 'schoolcode', 'schoolyear', 'schoolgp', 'classid', 'teachercode', 'effectfmdt']
                };

                return pks[model] ? pks[model] : null;
            };

            var checkDate = function($val)
            {
                var re = new RegExp('^\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}$', 'gi');

                if (re.test($val))
                {
                    var d = new Date($val);
                    d = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
                    return Math.round(d / 1000);
                }

                return $val;
            };

            /**
             * Add identifier field, create single string from fields (if object has composite PK)
             *
             * @param item
             * @param fields
             * @param idFieldName
             * @returns {*}
             */
            var addIdentifier = function (item, fields, idFieldName) {
                idFieldName = idFieldName || 'id';

                if (item.hasOwnProperty(idFieldName)) {
                    return item; //we will not overwrite the field
                }

                var pk = [];

                angular.forEach(
                    fields,
                    function (value) {
                        //check for field, log
                        var pkValue = checkDate(item[value]);
                        pk.push(pkValue == null || pkValue.length == 0  ? '-' : pkValue);
                    }
                );
                item[idFieldName] = pk.join('&');
                return item; //not actually required
            };

            var fields = getPkFieldsForModel(model);

            if (!fields) {
                //window.console && console.log('No PK fields for model: ' + model);
                return data;
            }

            if (operation == 'getList') {
                angular.forEach(data, function (item) {
                    addIdentifier(item, fields);
                })
            }
            else {
                addIdentifier(data, fields);
            }
            return data;
        };

        /**
         * Change when it need date params to integer
         *
         * @param operation - "get", "getList" - current operation
         * @param what - name of table to manage or view
         * @param params - query params
         * @returns {*}
         */
        var dateFormatter = function (operation, what, params, action) {
            var getDateFieldsForModel = function (model) {
                var dateFields = {
                    'batch': ['batchendtime', 'batchstarttime', 'batchcreatetime'],
                    'district_tgt': ['effectfmdt', 'effecttodt'],
                    'school_tgt': ['effecttodt'],
                    'school_gp_process_tgt': ['effectfmdt', 'effecttodt'],
                    'csv_alert': ['time_created'],
                    'csv_alert_subscription': ['time_created'],
                    'csv_batch': ['time_created',
                        'time_validation_start',
                        'time_row_insertion_start',
                        'time_error_fact_insertion_start',
                        'time_completed',
                        'time_error',
                        'expires_at'],
                    'user_register_stg': ['createdt']
                };
                return dateFields[model] ? dateFields[model] : null;
            };

            function getDateObj(dateString) {
                    var re = new RegExp('^\\d{4}-\\d{2}-\\d{2}(\\s+\\d{2}:\\d{2}:\\d{2})?$', 'gi');if (re.test(dateString)) {
                        var date = new Date(dateString);
                        var time = " 00:00:00"
                        return angular.isDefined(date) ? date : new Date(dateString + time);
                    }
                return;
            }

            var formatDate = function () {
                angular.forEach(params, function (param, name) {
                    var propsArray = getDateFieldsForModel(what);
                    if ($.inArray(name, propsArray) != -1) {
                        switch (action) {
                            case "utc" :
                                var date = getDateObj(param);
                                if (angular.isDefined(date)) {
                                    date = Date.UTC(date.getFullYear(),
                                                    date.getMonth(),
                                                    date.getDate(),
                                        date.getHours(),
                                                    date.getMinutes(),
                                                    date.getSeconds());
                                    params[name] = Math.round(date / 1000);
                                }
                        }
                    }
                })
                return params;
            }
            return formatDate();
        };

        // use the custom query parameters function to format the API request correctly
        RestangularProvider.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
            if (typeof(localStorage["ls.token"]) != 'undefined')
                headers['Authorization'] = "Bearer " + localStorage["ls.token"];
            if (operation == 'getList') {
                if (params._page) {
                    params.offset = (params._page - 1) * params._perPage;
                    params.limit = params._perPage;
                }
                params.sortDir = params._sortDir;
                delete params._page;
                delete params._perPage;
                delete params._sortDir;
                params.sort = params._sortField;
                delete params._sortField;
                if (params._filters) {
                    params.where = dateFormatter(operation, what, params._filters, 'utc');
                    delete params._filters;
                }
            }
            if (element != null) {
                dateFormatter(operation, what, element, 'utc');
            }
            return {params: params};
        });

        // use the custom query parameters function to format the API response correctly
        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response) {
            if (operation == "getList" && data.meta && typeof(data.meta.totalCount) != 'undefined') {
                response.totalCount = data.meta.totalCount;
            }
            getTableName(data, operation, what, response);
            getDistrictsList(data, operation, what, response)
            return processAPIResponse(data.result, operation, what);
        });
    }]);