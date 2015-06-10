angular
     .module('socialNetwork', [])
     .controller('LoginCtrl', function ($http, Auth) {
          vm = this;

          vm.login = function () {
               console.log('function firing')
               Auth.login(vm.email, vm.password, function () {})
          };

     })

     .factory('Auth', function ($rootScope) {
          return {
               login: function (email, password, cb) {
                    fb = new Firebase('https://socialnetwork.firebaseio.com/people');
                    fb.auth({
                         email: email,
                         password: password
                    }, function (err, authData) {
                         console.log(authData);
                         if (err) {
                              console.log(err)
                         } else {
                              console.log('it Worked! yayayayayayayay')
                              $rootScope.auth = authData;
                              cb();
                         }
                    })

                    }
               }
          })
