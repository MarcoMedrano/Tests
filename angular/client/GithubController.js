(function () {

  GithubController = function ($scope, githubService) {

    $scope.message = "Github Viewer";

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

  var githubViewer = angular.module("GithubViewer", []);
  githubViewer.controller("GithubController", GithubController);

}());