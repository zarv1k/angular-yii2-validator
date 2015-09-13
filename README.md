# angular-yii2-validator
Angular directive for automated handling of Yii2 server-side validation errors.

##Install

You can install this package with bower.

```
bower install -S angular-yii2-validator
```

##Usage
Add dependency 'yii2Validator' in your application module declaration.

```js
angular.module('yourApp', [
    // ...
    // your other module dependencies
    'yii2Validator'
])
```

In your template add the 'yii2-validate' attribute to the form in which you would like to receive server-side validation errors.

```html
<form yii2-validate ng-submit="form.submit()" name="form">
    <input ng-model="form.username" name="username" type="text" required>
    <span ng-show="form.username.$error.required" class="help-block">{{form.username.$error.required}}</span>
    <span ng-show="form.username.$error.serverMessage" class="help-block">{{form.username.$error.serverMessage}}</span>
</form>
```

In example above after form submit when server returns validation error for field 'username' the error message would be in 'form.username.$error.serverMessage'.
