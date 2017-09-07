(function () {

  GithubController = function ($scope, githubService, $routeParams) {

    $scope.message = "User view";
    $scope.usernameToFind = $routeParams.username;

    $scope.clickSearch = function (usernameToFind) {
      githubService.getUser(usernameToFind)
                   .then(function (user) {
                      console.log(user);
                      $scope.user = user;
                     
                      githubService.getRepos($scope.user)
                                   .then(function (repos) {
                                      $scope.repos = repos;
                                   });
                   });
    }
  }

  var githubModule = angular.module("GithubModule");
  githubModule.controller("GithubController", GithubController);

}());