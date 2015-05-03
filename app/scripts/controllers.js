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


      var gpsTime = function(){
 //onSuccess Callback
   //This method accepts a `Position` object, which contains
   //the current GPS coordinates

          console.log('in gpsTime')
        function onSuccess(position) {
            console.log('in onSuccess', position.coords.latitude)
            var key = '';
            for (var i = 0; i < 20; i++ ) {
                key += (Math.floor(Math.random() * 10)).toString();
            }
            $scope.firebase.albums[$scope.key].waypoints[key] = {
                lat: position.coords.latitude,
                long: position.coords.longitude,
                time: Date.now()
            };
        }

 //onError Callback receives a PositionError object

        function onError(error) {
            console.log('in onError', error)
          alert('code: '+ error.code + '\n' + 'message: ' + error.message + '\n');
        }


        var watchID = navigator.geolocation.watchPosition(onSuccess, onError);
      };

      var schedule = function (start, end, interval) {

        if (!start) {
          start = new Date().getTime();
        }

        if (!interval) {
            interval = 10000;
          //interval = 1200000;
        } else {
          interval = interval * 60000;
        }

        var nudge = new Date(start + interval);

        cordova.plugins.notification.local.schedule({
          at: nudge,
          badge: 1,
          text: 'Picture Time!'
        });

        console.log('scheduled!')
      };

      $scope.startStory = function (storyTitle, start, end, interval) {


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
                title: storyTitle,
                waypoints: {}
          };

          gpsTime();

        $scope.storyIsActive = true;

        schedule(start, end, interval);


        //Stories.startStory(start, end).then(function (data) {
          //console.log('Story has started.');
          //console.log('data', data);
        //});
      };

      $scope.endStory = function () {
          $scope.storyIsActive = false;
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
          schedule();
        }, function (err) {
          console.err(err);
        });
      };

    })

  .controller('MapsCtrl', function($scope, $ionicLoading) {

      var myLatlng = new google.maps.LatLng(37.3000, -120.4833);

      var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      navigator.geolocation.getCurrentPosition(function (pos) {
        map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        var myLocation = new google.maps.Marker({
          position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
          map: map,
          title: "My Location"
        });
      });

      $scope.map = map;
  })

    .controller('StoryViewCtrl', function($scope, $ionicLoading) {

        //function initialize() {
        //    var mapOptions = {
        //      center: { lat: -34.397, lng: 150.644},
        //      zoom: 8
        //    };
        //    var map = new google.maps.Map(document.getElementById('map-canvas'),
        //        mapOptions);
        //  }
        //initialize();
    })

    .controller('StoriesCtrl', function ($scope, $state, $firebaseObject) {
      var fbRef = new Firebase('https://storyapp.firebaseio.com/');
      var firebase = $firebaseObject(fbRef);
      firebase.$bindTo($scope, 'firebase');

      $scope.stories = {};

      $scope.showStory = function(storyId) {
        $state.go('tab.stories.story-view', { storyId: storyId })
        //if ($scope.currentStory === storyId){
          //$scope.currentStory = null;
          //return;
        //}
        //$scope.currentStory = storyId;
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
