angular.module('starter.services', [])

.factory('socket',function(socketFactory){
        //Create socket and connect to http://chat.socket.io 
        var myIoSocket = io.connect('http://46.101.212.4:8000');

        mySocket = socketFactory({
            ioSocket: myIoSocket
        });

        return mySocket;
    })