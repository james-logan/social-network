angular
  .module('socialNetwork', ["ngRoute"])
  .constant('API_URL', 'https://socialnetwork.firebaseio.com/')
  .controller('LoginCtrl', function ($http, Auth) {
    var vm = this;

    vm.login = function () {
         console.log('function firing')
         Auth.login(vm.email, vm.password, function () {})
    };

    vm.register = function ($location) {

    }

    vm.showRegistration = false;

  })

  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'logger'
      })
      .when('/profileform', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl',
        controllerAs: 'profedit'
      })
  })

  .factory('Auth', function (API_URL, $location, $rootScope) {
    var fb = new Firebase(API_URL);

    return {

      requireLogin() {
        $rootScope.auth = fb.getAuth();
        if (!fb.getAuth()) {
          $location.path('/login');
        } else if ($rootScope.auth && $rootScope.auth.password.isTemporaryPassword) {
          $location.path('/temp_pass')
        }
      },

      logout (cb) {
        fb.unauth(function () {
          $rootScope.auth = null;
          cb();
        });
      },

      login(email, password, cb){
        fb.authWithPassword({
          email: email,
          password: password
        }, function (err, authData) {
          if (err) {
            console.log('Error', err)
          } else {
            $rootScope.auth = authData;
            cb();
          }
        });
      },

      register(email, password, cb){
        fb.createUser({
          email: email,
          password: password
        }, function (err, authData) {
          if (err) {
            console.log('Error', err);
          } else {
            cb();
          }
        })
      },

      reset(email){
        fb.resetPassword({
          email: email
        }, function(err) {
          if (err) {
            console.log("Error sending password reset email:", err)
          } else {
            alert("Please check your email")
          }
        })
      },

      newPass(oldpass, newpass, cb) {
        fb.changePassword({
          email: $rootScope.auth.password.email,
          oldPassword: oldpass,
          newPassword: newpass
        }, function(err) {
          if (err) {
            console.log("Error changing password:", err);
          } else {
            alert("Password successfully changed");
            cb();
          }
      })
      }

    }
    })
