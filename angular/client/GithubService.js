(function(){

  GithubService = function($http){
    var urlBase ="https://api.github.com/users/";
    
    var getUser = function(usernameToFind){
      return $http.get(urlBase + usernameToFind)
                  .then(function(response) {
                    return response.data;
                  });
    }
    
    var getRepos = function(user){
      return $http.get(user.repos_url)
                  .then(function(response) {
                      return response.data;
                  });  
    }
  
    return {
      getUser:getUser,
      getRepos:getRepos
    };
  }
  
  var module = angular.module("GithubViewer");
  module.factory("githubService", GithubService)
  
}())