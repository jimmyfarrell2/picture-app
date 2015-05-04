angular.module('starter.controllers', [])

  .controller('CreateCtrl', function ($scope, Stories, Camera, $firebaseObject) {
    var fbRef = new Firebase('https://storyapp.firebaseio.com/');
    var firebase = $firebaseObject(fbRef);
    firebase.$bindTo($scope, 'firebase');

    $scope.scope = {};
    $scope.storyIsActive = false;

    document.addEventListener("resume", appResumed, false);
    document.addEventListener("deviceready", deviceReady, false);
    function appResumed() {
        cordova.plugins.notification.local.cancelAll();
    }
    function deviceReady() {
        cordova.plugins.notification.local.cancelAll();
    }

    $scope.startSlots = {epochTime: 12600, format: 12, step: 15};
    $scope.endSlots = {epochTime: 12600, format: 12, step: 15};

    $scope.toggleScheduler = function () {
      $scope.showScheduleOptions = !($scope.showScheduleOptions);
    };

    var watchID;
    var gpsTime = function () {
      //onSuccess Callback
      //This method accepts a `Position` object, which contains
      //the current GPS coordinates

      function onSuccess(position) {
        var key = '';
        for (var i = 0; i < 20; i++) {
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
        alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
      }

      watchID = navigator.geolocation.watchPosition(onSuccess, onError, { enableHighAccuracy: true });
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
        id: 1,
        at: nudge,
        badge: 1,
        text: 'Picture Time!'
      });

    };

    $scope.startStory = function (storyTitle, start, end, interval) {


      $scope.key = '';
      for (var i = 0; i < 10; i++) {
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

    };

    $scope.endStory = function () {
      $scope.storyIsActive = false;
      navigator.geolocation.clearWatch(watchID);
      cordova.plugins.notification.local.cancelAll();
      $scope.scope.storyTitle = null;
    };

    var onComplete = function (error) {
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

    var getLocation = function () {
      navigator.geolocation.getCurrentPosition(function (position) {
        coordinates = {
          lat: position.coords.latitude,
          long: position.coords.longitude
        };
      });
    };

    $scope.takePhoto = function(){

      getLocation();

      Camera.getPicture(cameraOptions).then(function (base64Image) {
        $scope.previewPhoto =  base64Image;
      }, function (err) {
        console.err(err);
      });
    };

    $scope.savePhoto = function(caption){
      var key = '';
      for (var i = 0; i < 6; i++) {
        key += (Math.floor(Math.random() * 10)).toString();
      }

      if (!$scope.firebase.albums[$scope.key].pictures) {
        $scope.firebase.albums[$scope.key].pictures = {};
      }
      $scope.firebase.albums[$scope.key].pictures[key] = {
        image: $scope.previewPhoto,
        coordinates: coordinates,
        caption: caption,
        time: Date.now()
      };
      $scope.previewPhoto = null;
      $scope.scope.caption = null;
      schedule();
    }
  })

  .controller('MapsCtrl', function ($scope, $stateParams, $ionicLoading, $firebaseObject) {
    var fbRef = new Firebase('https://storyapp.firebaseio.com/');
    var firebase = $firebaseObject(fbRef);
    firebase.$bindTo($scope, 'firebase');
    var storyId = $stateParams.storyId;

    var markers = [];

    function addMarker(location) {
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: 'images/blue-dot.png'
      });
      markers.push(marker);
    }

    function setAllMap(map) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
      }
    }

    function clearMarkers() {
      setAllMap(null);
    }

    var myLatlng = new google.maps.LatLng(40.704977, -74.010739);

    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    $scope.map = map;

    var pathCoordinates = [];
    angular.forEach($scope.firebase.albums[storyId].waypoints, function (waypointInfo, waypointId) {
      pathCoordinates.push(waypointInfo);
      //addMarker(pos);
    });
    pathCoordinates.sort(function(a, b) {
        if (a.time < b.time) {
            return -1;
        }
        else if (a.time > b.time) {
            return 1;
        }
        else {
            return 0;
        }
    });
    pathCoordinates = pathCoordinates.map(function (waypoint) {
      return new google.maps.LatLng(waypoint.lat, waypoint.long);
    });
    var flightPath = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 4
    });

    flightPath.setMap(map);

    map.setCenter(pathCoordinates[0]);

    var infowindow = new google.maps.InfoWindow();

    angular.forEach($scope.firebase.albums[storyId].pictures, function (pictureInfo, pictureId) {
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(pictureInfo.coordinates.lat, pictureInfo.coordinates.long),
        icon: 'images/photo.png',
        map: map
      });

      google.maps.event.addListener(marker, 'click', (function () {
        return function () {
          var image = '<img src="data:image/jpg;base64,' + pictureInfo.image + '"><br/><p>'+pictureInfo.caption+'</p>';
          infowindow.setContent(image);
          infowindow.open(map, marker);
        }
      })())
    });
  })

  .controller('StoryViewCtrl', function ($scope, $ionicLoading) {

  })

  .controller('StoriesCtrl', function ($scope, $state, $firebaseObject) {
    var fbRef = new Firebase('https://storyapp.firebaseio.com/');
    var firebase = $firebaseObject(fbRef);
    firebase.$bindTo($scope, 'firebase');

    $scope.stories = {};

    $scope.showStory = function (storyId) {
      $state.go('tab.stories.story-view', {storyId: storyId});
    };

    $scope.$watch('firebase.albums', function (newStories, oldStories) {
      angular.forEach(newStories, function (storyInfo, storyId) {
        if (storyInfo.owner === 'ben') {
          $scope.stories[storyId] = storyInfo;
        }
      });
    });
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
