(function () {
    'use strict';

    angular.module('yii2Validator', [])
        .constant('YII2_VALIDATE_EVENT', 'yii2-validate-event')
        .factory('yii2ResponseInterceptor', ['$q', '$rootScope', 'YII2_VALIDATE_EVENT', responseInterceptor])
        .directive('yii2Validate', ['YII2_VALIDATE_EVENT', yii2ValidateDirective])
        .directive('ngSubmit', yii2NgSubmit)
        .config(['$httpProvider', configModule])
        .run(['$log', run]);

    function configModule($httpProvider) {
        $httpProvider.interceptors.push('yii2ResponseInterceptor');
    }

    function run($log) {
        $log.debug('yii2-validator module loaded');
    }

    function yii2NgSubmit() {
        return {
            require:'?form',
            priority: 10,
            link: {
                pre: function (scope, element, attrs, form) {
                    element.on('submit', function () {
                        if (form && form.$valid) {
                            form.yii2Validating = true;
                        }
                    });
                }
            }
        };
    }

    function yii2ValidateDirective(YII2_VALIDATE_EVENT) {
        return {
            require: '^form',
            restrict: 'A',
            link: function (scope, el, attrs, ctrl) {
                var form = ctrl;

                angular.forEach(form, function (ngModel) {
                    if (angular.isObject(ngModel) && ngModel.hasOwnProperty('$modelValue')) {
                        ngModel.$validators.server = function () {
                            ngModel.$setValidity('server', true);
                            delete ngModel.$error.server;
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
                                form[error.field].$error.server = error.message;
                            }
                        });
                    }
                });
            }
        };
    }

    function responseInterceptor($q, $rootScope, YII2_VALIDATE_EVENT) {
        return {
            responseError: function (rejection) {
                if (rejection.status && 422 === rejection.status) {
                    $rootScope.$broadcast(YII2_VALIDATE_EVENT, {
                        errors: rejection.data !== undefined ? rejection.data : []
                    });
                }

                return $q.reject(rejection);
            }
        };
    }
})();