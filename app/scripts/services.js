angular.module('starter.services', [])

.factory('Stories', function($http) {

  return {
    startStory: function() {

    },

    endStory: function() {
      return $http.get('http://localhost:3001/end').then(function(res) {
        console.log('endStory in factory');
        return res.data;
      });
    }

  };

})

.factory('Camera', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    }
  }
});
