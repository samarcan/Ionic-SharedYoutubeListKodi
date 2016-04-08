// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','btford.socket-io'])

.run(function($ionicPlatform, $state, $rootScope) {
  console.log("Aqui estoy")
  $ionicPlatform.ready(function() {


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    var incomingURL
      window.plugins.webintent.getExtra(window.plugins.webintent.EXTRA_TEXT,
          function(url) {
            $rootScope.url = url
           data = {
            url : url
           }
            $state.go('list_videos', data);
          }, function() {
            data = {
              url : "None"
            }
            $state.go('list_videos', data);
          }
      );

      document.addEventListener("pause", function(){

      ionic.Platform.exitApp()
      })    

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  $stateProvider



  .state('dash', {
    url: '/dash',
    views: {
      'app': {
        templateUrl: 'templates/app.html',
        controller: 'AppCtrl'
      }
    }
  })
  .state('list_videos', {
    url: '/list_videos/:url',
    cache: false,
    views: {
      'app': {
        templateUrl: 'templates/list_videos.html',
        controller: 'ListVideosCtrl'
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/list_videos');

});
