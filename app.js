
var app = angular.module("app", [
  "ngRoute"
]);

app.filter('htmlToPlaintext', function() {
    return function(text) {
      var plain = String(text).replace(/<[^>]+>/gm, '');

      plain.replace(/&nbsp;/gi,' ');
      return plain;
    }
});

//http://stackoverflow.com/questions/16310298/if-a-ngsrc-path-resolves-to-a-404-is-there-a-way-to-fallback-to-a-default
app.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {

      scope.$watch(function() {
          return attrs['ngSrc'];
        }, function (value) {
          if (!value) {
            element.attr('src', attrs.errSrc);
          }
      });

      element.bind('error', function() {
        element.attr('src', attrs.errSrc);
      });
    }
  }
});

app.config(['$routeProvider','$locationProvider',
  function($routeProvider,$locationProvider){
    $routeProvider.
      when('/about',{
      templateUrl: 'partials/about.html',
      controller: 'IndexCtrl'
    }).
      otherwise({
      redirectTo:'/',
      templateUrl: 'partials/index.html',
      controller: 'IndexCtrl'
    });

    //$locationProvider.html5Mode(true);

  }
]);

app.factory('DataService', function ($http, $q){

  var DataService = {};
  DataService.getData = function(path){
    var deferred = $q.defer();
    $http.get('data/'+path+'.json').
        success(function(data, status, headers, config) {
          deferred.resolve(data);
        }).
        error(function(data, status, headers, config) {
          deferred.resolve(data);
        });
    return deferred.promise;
  };


  return DataService;
})

app.controller('IndexCtrl', ['$scope', 'DataService', '$location', '$sce', function ($scope, DataService, $location, $sce){

  DataService.getData('parsed_issues').then(function(data){
      $scope.issues = data;
  });

  $scope.candidateFilter = function(n){
      if(n.state === 'responded')
         return n;
  };

  $scope.go = function(path){
      $("body").scrollTop(0);
      $location.path(path);
  };

  DataService.getData('parsed_questions').then(function(data){
      $scope.questions = [];
      $scope.questionsObj = data;
      for(var key in data){
          $scope.questions.push(data[key]);
      }
  });
  DataService.getData('parsed_candidates').then(function(data){
      $scope.candidates = data;
  });



  $scope.showQuestion = function(qid){
    return $scope.focusQuestion === qid;
  };

  $scope.toggleQuestion = function(qid){
    if($scope.focusQuestion === qid){
       $scope.focusQuestion = false;
       $scope.focusQuestionTitle = null;

    }else{
      $scope.focusQuestion = qid;
      $scope.focusQuestionTitle = $scope.questionsObj[qid].title;

    }

  };

  $scope.toTrusted = function(html_code) {
    return $sce.trustAsHtml(html_code);
  };
  $scope.responseShowState = {};
  $scope.toggleResponse = function(rid){
    $scope.responseShowState[rid] = !$scope.responseShowState[rid];
  };
  $scope.showResponse = function(rid){
    return $scope.responseShowState[rid];
  };



  $scope.pendingFilter = function(n){
     controller.log(n.state);
     if(n.state === 'pending')
        return n;
  };

  $scope.toggleCandidate = function(cid){
    if(!$scope.candidates[cid].filter){
      $scope.candidates[cid].filter = 'asked';

    }else{

      switch($scope.candidates[cid].filter){
        case 'asked':
        $scope.candidates[cid].filter = 'responded';
        break;

        case 'responded':
        $scope.candidates[cid].filter = 'pending';
        break;

        case 'pending':
        $scope.candidates[cid].filter = 'notasked';
        break;

        case 'notasked':
        $scope.candidates[cid].filter = 'none';
        break;

        case 'none':
        $scope.candidates[cid].filter = 'asked';
        break;

      }

    }




  };


  $scope.shouldShowFilter = function(n){
      var result = true;
      for(var k in $scope.candidates){
          if($scope.candidates[k].election_state === 'join'){

              if($scope.candidates[k].filter){
                  //console.log($scope.candidates[k][qid]);
                  switch($scope.candidates[k].filter){

                      case 'asked':
                      if($scope.candidates[k][n.id] === 'notasked')
                          result = false;
                      break;

                      case 'responded':
                      //console.log("===case responded===")
                      if($scope.candidates[k][n.id] !== 'responded')
                        result = false;
                      break;

                      case 'pending':
                      //console.log("===case pending===")
                      if($scope.candidates[k][n.id] !== 'pending')
                        result = false;
                      break;

                      case 'notasked':
                      if($scope.candidates[k][n.id] !== 'notasked')
                          result = false;
                      break;


                  };
              }
          }

      };
      if(result)
        return n;

  };


}]);



