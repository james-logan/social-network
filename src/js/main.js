angular
  .module('socialNetwork', ["ngRoute"])
  .constant('API_URL', 'https://socialnetwork.firebaseio.com/')

  .run(function(Auth, $rootScope, API_URL) {
     // var fb = new Firebase(API_URL);
     // $rootScope.auth = fb.getAuth();
  // can access private property within nextRoute argument.
    $rootScope.$on('$routeChangeStart', function(event, nextRoute) {
      if (nextRoute.$$route && nextRoute.$$route.private) {
        Auth.requireLogin();
      }
    })
  })
  // .controller('ProfileCtrl', function ($http, $location, $rootScope) {
  //    var vm = this;

  //    vm.editProfile = function ($rootScope.auth.uid) {
  //         $http
  //              .put(`${API_URL}profiles/${$rootScope.auth.uid}.json`);
  //    }

  // })

  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'logger',
        resolve: {
          checkLogin: function ($rootScope, $location) {
            if ($rootScope.auth) {
              $location.path('/people');
            }
          }
        }
      })
      .when('/logout', {
        template: '<h1>Logging out...</h1>',
        controller: 'LogoutCtrl'
      })
      // .when('/profileform', {
      //   templateUrl: 'views/profileform.html',
      //   controller: 'ProfileCtrl',
      .when('/profileform', {
        templateUrl: 'views/profileform.html',
        controller: 'EditProfileCtrl',
        controllerAs: 'profedit',
        private: true
      })
      .when('/potentialfriends', {
        templateUrl: 'views/potentialfriends.html',
        controller: 'PotFriendsCtrl',
        controllerAs: 'pfctrl',
        private: true
      })
      .when('/profilepage', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl',
        controllerAs: "profctrl",
        private: true
      })
      .when('/friendslist', {
        templateUrl: 'views/friendslist.html',
        controller: 'FriendsListCtrl',
        controllerAs: 'flCtrl',
        private: true
      })
  })

  .controller('FriendsListCtrl', function ($http, $rootScope, API_URL, Friends) {
    var vm = this;

    Friends.getAllFriends(function (kittens) {
      console.log('where are all the friends?')
      vm.data = kittens;
    })

  })

  .filter('objToArr', function () {
    return function (obj) {
      if (obj) {
        return Object
          .keys(obj)
          .map(function (key) {
            obj[key]._id = key;
            return obj[key];
          });
      }
    }
  })

  .controller('ProfileCtrl', function ($http, API_URL, $rootScope) {
    var vm = this;

    // var fb = new Firebase(API_URL);
    // fb.child("profiles").child($rootScope.auth.uid).once('value', function(data) {
    //   vm.data = data.val();
    // });

    $http
      .get(`${API_URL}profiles/${$rootScope.auth.uid}.json`)
      .success(function(data) {
        vm.data = data
      })
  })

  .controller('PotFriendsCtrl', function (Friends) {
    var vm = this;

    Friends.getAll(function(friends) {
      vm.potfriends = friends;
    })

    vm.addFriend = function(id) {
      console.log(id);
    }

  })

  .controller('LoginCtrl', function ($scope, $http, Auth) {
    var vm = this;

    vm.login = function () {
      console.log('function firing')
      Auth.login(vm.email, vm.password, function () {
        Auth.requireProfile(function() {
          $scope.$apply();
        });
      })
    };

    vm.register = function ($location) {
      Auth.register(vm.email, vm.password, function() {
        vm.login();
      })
    }

    vm.showRegistration = false;

  })

  .controller('LogoutCtrl', function($scope, $location, Auth) {
    Auth.logout(function() {
      $location.path('/login');
      $scope.$apply();
    })
  })

  .controller('EditProfileCtrl', function($http, $location, $rootScope, API_URL) {
    var vm = this;

    var info = {};

    vm.editProfile = function () {
      console.log("do things")
      $http
        .put(`${API_URL}profiles/${$rootScope.auth.uid}.json`, vm.info)
        .success(function () {
          $location.path("/profilepage")
        })
    }
  })

  .factory('Friends', function ($http, API_URL, $rootScope) {
    return {
      getAll(cb) {
        $http
          .get(`${API_URL}/profiles.json`)
          .success(cb);
      },
      addFriend(cb) {
      },
      getAllFriends(cb){
        debugger;
        $http
          .get(`${API_URL}friendlist/${$rootScope.auth.uid}.json`)
          .success(cb);
      }
    }
  })

  .factory('Auth', function (API_URL, $location, $rootScope) {
    var fb = new Firebase(API_URL);

    return {

      requireLogin() {
        $rootScope.auth = fb.getAuth();
        if (!fb.getAuth()) {
          $location.path('/login');
          cb();
        } else if ($rootScope.auth && $rootScope.auth.password.isTemporaryPassword) {
          $location.path('/temp_pass')
        }
      },

      // need to clarify firebase data structure for this function below;
      // I'm assuming we'll have a profiles object & a friend list object,
      // within which we'll have individual user objects accessible via
      // their uids as keys.

      // only use requireProfile for users who are already logged in (or you could check for that within the function);

      requireProfile(cb) {
        var hasProfile;
        fb.child("profiles").child($rootScope.auth.uid).once('value', function(data) {
          hasProfile = data.exists();
          if (!hasProfile) {
            $location.path('/profileform');
          } else {
            $location.path('/profilepage');
          }
          cb();
        })
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
            console.log("setting root scope authData")
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
