angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, socket) {


  socket.on('connect',function(){
        //Add user called nickname
    socket.emit('joinServer','Usuario');
  });
  $scope.socket = socket;
  $scope.recognizedText = "";
  $scope.record = function(socket) {
      //var recognition = new webkitSpeechRecognition(); //To Computer
      var recognition = new SpeechRecognition(); // To Device
      recognition.lang = 'es-ES';
      
      recognition.onresult = function(event) {
          if (event.results.length > 0) {
              $scope.recognizedText = event.results[0][0].transcript;
              $scope.socket.emit('commandInbox', $scope.recognizedText)
              $scope.$apply();
          }
      };
      recognition.start();
  }
})



.controller('ListVideosCtrl', function($scope, $http,$rootScope, $stateParams, $ionicPopup, $state, $ionicPlatform) {
 $scope.$on('$ionicView.beforeEnter', function() {
      if($rootScope.url != undefined){
    if($rootScope.url.indexOf('http') != -1 && $rootScope.url.indexOf('list') != -1){
    console.log($rootScope.url)
      str = $rootScope.url
      str = str.split('http')[1]
      id = str.split('list=')[1]
      $http
      .get('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=' + id + '&key=AIzaSyCb5GjVu0VqnG54pH4HOc4H01-S5T_Zq4U')
      .success(function(data){
        $scope.items = data.items
        $scope.num_items = data.items.length
        if (data.nextPageToken != undefined) getPages($scope, $http, data.nextPageToken, id)
      })
    }
    else{
      $scope.items = []
      $scope.num_items = 0
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'El link no es una lista de YouTube'
      });
    }
  }
  else{
    $scope.items = []
    $scope.num_items = 0
  }
});



  $scope.sendVideos = function(url){
    console.log(url)
    clearPlayList($http,url)
    for (item in $scope.items){
      id = $scope.items[item].snippet.resourceId.videoId
      queueVideo($http,id,url)    
    }
    playFirstVideo($http,url)
  }

  $scope.queueVideos = function(url){
    console.log(url)
    for (item in $scope.items){
      id = $scope.items[item].snippet.resourceId.videoId
      queueVideo($http,id,url)    
    }
  }

  $scope.showSelectedItem = function(item, selection){
    serverPopup.close()
    if(selection == "queue"){
      $scope.queueVideos(item)
    }
    else{
      $scope.sendVideos(item)
    }
  }

  $scope.showPopUpAddServer = function(selection){
    $scope.data = {};
    addServerPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.newServer">',
      title: 'Añade un nuevo servidor Kodi',
      scope: $scope,
      buttons: [
        { 
          text: 'Cancel' ,
          onTap: function(e) {
            return "";
          }
        },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.newServer) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.data.newServer;
            }
          }
        }
      ]
    })
    addServerPopup.then(function(res) {
      if(res != ""){
        if(localStorage.getItem("servers") == "null" || localStorage.getItem("servers") == null){
          arr = []
          arr.push(res)
          localStorage.setItem("servers", arr)
        }
        else{
          localServers = localStorage.getItem("servers")
          if(localServers.indexOf(',') != -1){
            servers = localServers.split(',')
            if(!(res in servers)){
              servers.push(res)
            }
          }
          else{
            servers = []
            servers.push(localServers)
            if(localServers != res)servers.push(res)
          }
          localStorage.setItem("servers", servers)
        }
      }
      else{
      }
    });
  }

  $scope.showPopUpSelectServer = function(selection){
    $scope.selection = selection
    if(localStorage.getItem("servers") != "null" && localStorage.getItem("servers") != null){
      $scope.list_servers = localStorage.getItem("servers").split(',')
      serverPopup = $ionicPopup.show({
        template: '<ion-list><ion-item ng-repeat="server in list_servers" style="text-align:center;height:50px;" ng-click="showSelectedItem(server, selection)"><strong>{{server}}</strong></ion-item></ion-list>',
        title: 'Elige el servidor Kodi',
        scope: $scope,
        buttons: [
          {
            text: '<b>Cancel</b>',
            onTap: function(e) {
             $scope.cancel = true;
            }
          }
        ]
      })
    }
    else{
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'Primero debes añadir algún servidor Kodi'
      });
    }
  }

});

function getPages($scope, $http, nextPageToken, id){
   $http
      .get('https://www.googleapis.com/youtube/v3/playlistItems?pageToken='+ nextPageToken +'&part=snippet&playlistId=' + id + '&key=AIzaSyCb5GjVu0VqnG54pH4HOc4H01-S5T_Zq4U')
      .success(function(data){
        $scope.num_items += data.items.length
        $scope.items = $scope.items.concat(data.items)
        if (data.nextPageToken != 'undefined') getPages($scope, $http, data.nextPageToken, id)
      })
}

function queueVideo($http, id, url){
  data = {
    jsonrpc: "2.0",
    method: "Playlist.Add",
    params: {
      playlistid: 1,
      item: {
        file: "plugin://plugin.video.youtube/?action=play_video&videoid=" + id
        }
      },
    id: 1
  }        
  $http
    .post('http://' + url + '/jsonrpc', data,{headers: { 'Content-Type': 'application/json'}})
}

function playFirstVideo($http, url){
  data = {
    jsonrpc: "2.0",
    method: "Player.Open",
    params: {
      item: {
        playlistid: 1,
        position: 0
      }
    },
    id: 1
  }
  $http
    .post('http://' + url + '/jsonrpc', data,{headers: { 'Content-Type': 'application/json'}})
}

function clearPlayList($http, url){
  data = {
    jsonrpc: "2.0",
    method: "Playlist.Clear",
    params: {
      "playlistid": 1
    },
    id: 1
  }
  $http
    .post('http://' + url + '/jsonrpc', data,{headers: { 'Content-Type': 'application/json'}})
}



