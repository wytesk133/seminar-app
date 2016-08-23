var seminarApp = angular.module('seminarApp', []);

seminarApp.controller('QuestionnaireBuilderController', function QuestionnaireBuilderController($scope) {
  $scope.questionnaire = data;
  $scope.types = [
    {value: 'text', name: 'Short Text'},
    {value: 'rating', name: 'Rating (1-5)'}
  ];
  $scope.add = function() {
    $scope.questionnaire.push($scope.new);
    $scope.new = {};
  };
  $scope.remove = function(item) {
    var index = $scope.questionnaire.indexOf(item);
    $scope.questionnaire.splice(index, 1);
  }
});
