(function(){

    var githubModule = angular.module("GithubModule", ["ngRoute"]);

    githubModule.config(function($routeProvider){
        $routeProvider.when("/user", {
                                                    templateUrl:"GithubView.html",
                                                    controller: "GithubController"
                                                  })
                      .when("/repos/:user/:repo", {
                                                    templateUrl:"repos/RepoView.html",
                                                    controller: "RepoController"
                                                  })
                    //.otherwise({redirectTo:"/user"});
    });
}());