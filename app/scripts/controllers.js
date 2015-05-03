angular.module('starter.controllers', [])

    .controller('CreateCtrl', function ($scope, Stories, Camera, $firebaseObject) {
      var fbRef = new Firebase('https://storyapp.firebaseio.com/');
      var firebase = $firebaseObject(fbRef);
      firebase.$bindTo($scope, 'firebase');

      $scope.storyIsActive = false;

      $scope.startSlots = {epochTime: 12600, format: 12, step: 15};
      $scope.endSlots = {epochTime: 12600, format: 12, step: 15};

      $scope.toggleScheduler = function(){
        $scope.showScheduleOptions = !($scope.showScheduleOptions);
      };

      $scope.gpsArr = [];

//      var gpsTime = function(){
//// onSuccess Callback
////   This method accepts a `Position` object, which contains
////   the current GPS coordinates
////
//        function onSuccess(position) {
//          gpsArr.push(position);
//        }
//
//// onError Callback receives a PositionError object
////
//        function onError(error) {
//          alert('code: '+ error.code + '\n' + 'message: ' + error.message + '\n');
//        }
//
//// Options: throw an error if no update is received every 30 seconds.
////
//        var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });
//      };

      //gpsTime();

      //var schedule = function (start, end, interval) {

        //if (!start) {
          //start = new Date().getTime();
        //}

        //if (!interval) {
          //interval = 1200000;
        //} else {
          //interval = interval * 60000;
        //}

        //var nudge = new Date(start + interval);
        //console.log('duh');

        //cordova.plugins.notification.local.schedule({
          //at: nudge,
          //badge: 1,
          //text: 'Picture Time!'
        //});

        //console.log('scheduled!')

      //};

      $scope.startStory = function (storyTitle, end, interval) {

            $scope.key = '';
            for (var i = 0; i < 10; i++ ) {
                $scope.key += (Math.floor(Math.random() * 10)).toString();
            }

            if (!$scope.firebase.albums) {
                $scope.firebase.albums = {};
            }
          $scope.firebase.albums[$scope.key] = {
              id: $scope.key,
                owner: "ben",
                title: storyTitle
          };

        $scope.storyIsActive = true;

        //schedule(start, end, interval);


        //Stories.startStory(start, end).then(function (data) {
          //console.log('Story has started.');
          //console.log('data', data);
        //});
      };

      $scope.endStory = function () {
        Stories.endStory().then(function (data) {
          console.log('Story has ended.');
          console.log('data', data);
          $scope.storyIsActive = false;
        });
      };

      var onComplete = function(error) {
        if (error) {
          console.log('Upload failed');
        } else {
          console.log('Upload succeeded');
        }
      };

      var cameraOptions = {
        quality: 75,
        targetWidth: 320,
        targetHeight: 320,
        destinationType: 0,
        sourceType: 1,
        allowEdit: true,
        encodingType: 0,
        saveToPhotoAlbum: false
      };

    var coordinates = {};

    var getLocation = function(){
      navigator.geolocation.getCurrentPosition( function(position){
        console.log('POSTITION', position.coords.latitude)
        coordinates = {
            lat: position.coords.latitude,
            long: position.coords.longitude
          };
      });
    };

      $scope.takePhoto = function () {

        getLocation();

        Camera.getPicture(cameraOptions).then(function (base64Image) {
            var key = '';
            for (var i = 0; i < 6; i++ ) {
                key += (Math.floor(Math.random() * 10)).toString();
            }
            if (!$scope.firebase.albums[$scope.key].pictures) {
                $scope.firebase.albums[$scope.key].pictures = {};
            }
          $scope.firebase.albums[$scope.key].pictures[key] = {
            image: base64Image,
            coordinates: coordinates
          };
        }, function (err) {
          console.err(err);
        });
      };

    })

    .controller('StoriesCtrl', function ($scope, $firebaseObject) {
      var fbRef = new Firebase('https://storyapp.firebaseio.com/');
      var firebase = $firebaseObject(fbRef);
      firebase.$bindTo($scope, 'firebase');

      $scope.stories = {};

      $scope.showStory = function(storyId) {
        if ($scope.currentStory === storyId){
          $scope.currentStory = null;
          return;
        }
        $scope.currentStory = storyId;
      };

      $scope.$watch('firebase.albums', function(newStories, oldStories) {
          angular.forEach(newStories, function(storyInfo, storyId) {
              if (storyInfo.owner === 'ben') {
                  $scope.stories[storyId] = storyInfo;
              }
          });
      });
    })

//.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
//  $scope.chat = Chats.get($stateParams.chatId);
//})

    .controller('AccountCtrl', function ($scope) {
      $scope.settings = {
        enableFriends: true
      };
    });
