(function(){

    RepoController = function($scope){
        $scope.message = "Github Viewer";
        $scope.repo = {name:'My name'};
    }

    
    var githubModule = angular.module("GithubModule");
    githubModule.controller("RepoController", RepoController);
}())