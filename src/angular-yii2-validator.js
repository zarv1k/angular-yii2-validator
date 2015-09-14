(function () {
    'use strict';

    angular.module('yii2Validator', [])
        .constant('YII2_VALIDATE_EVENT', 'yii2-validate-event')
        .factory('yii2ResponseInterceptor', ['$log', '$q', '$rootScope', 'YII2_VALIDATE_EVENT', responseInterceptor])
        .directive('yii2Validate', ['$log', 'YII2_VALIDATE_EVENT', yii2ValidateDirective])
        .directive("ngSubmit", ['$log', yii2NgSubmit])
        .config(['$httpProvider', configModule])
        .run(['$log', run]);

    function configModule($httpProvider) {
        $httpProvider.interceptors.push('yii2ResponseInterceptor');
    }

    function run($log) {
        $log.debug('yii2-validator module loaded');
    }

    function yii2NgSubmit($log) {
        return {
            require: "?form",
            priority: 10,
            link: {
                pre: function (scope, element, attrs, form) {
                    element.on("submit", function () {
                        $log.debug('On submit form name ' + form.$name);
                        if (form && form.$valid) {
                            form.yii2Validating = true;
                        }
                    })
                }
            }
        }
    }

    function yii2ValidateDirective(YII2_VALIDATE_EVENT, $log) {
        return {
            require: '^form',
            restrict: 'A',
            link: function (scope, el, attrs, ctrl) {
                var form = ctrl;

                angular.forEach(form, function (ngModel) {
                    if (angular.isObject(ngModel) && ngModel.hasOwnProperty('$modelValue')) {
                        ngModel.$validators.server = function () {
                            ngModel.$setValidity('server', true);
                            delete ngModel.$error.serverMessage;
                            return true;
                        };
                    }
                });

                scope.$on(YII2_VALIDATE_EVENT, function (event, data) {
                    if (form.yii2Validating) {
                        form.yii2Validating = false;
                        angular.forEach(data.errors, function (error) {
                            if (form.hasOwnProperty(error.field)) {
                                form[error.field].$setValidity('server', false);
                                form[error.field].$error.serverMessage = error.message;
                            }
                        });
                    }
                    else {
                        $log.debug('Form ' + form.$name + ' not submitting');
                    }
                });
            }
        };
    }

    function responseInterceptor($log, $q, $rootScope, YII2_VALIDATE_EVENT) {
        var attributes;

        return {
            request: function (config) {
                $log.debug('Request:');
                return config;
            },
            responseError: function (rejection) {
                attributes = rejection.data !== undefined ? rejection.data : [];
                if (422 === rejection.status) {
                    $rootScope.$broadcast(YII2_VALIDATE_EVENT, {
                        errors: attributes
                    });
                }

                return $q.reject(rejection);
            }
        };
    }
})();