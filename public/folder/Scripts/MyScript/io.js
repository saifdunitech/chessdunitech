//var express  = require('express');
////var mongoose = require('mongoose');
//var app      = express();
//var server   = require('http').Server(app);
//var express = require('express')
//  , http = require('http');

//var app = express();
//var server = http.createServer(app);
//var io = require("../lip/socket.io")(server);

//app.use(express.static(__dirname = +'/public'));
//io.on('connection', function (socket) {
//    console.log('new Connnetion');

//    socket.on('add-player', function (player) {
//        io.emit('notification', {
//            message: 'new Player',
//            player: player
//        });
//    });
//});

//server.listen(2858, function () {
//    console.log('server up and running at 2858 port');
//});


// include the http module
//var http = require('http');

// create a webserver
//http.createServer(function (req, res) {

    // respond to any incoming http request
 //   res.writeHead(200, { 'Content-Type': 'text/plain' });
  //  res.end('Hello World\n');

//}).listen(1337, '127.0.0.1');

// log what that we started listening on localhost:1337
//console.log('Server running at 127.0.0.1:1337');

//var express = require('express');

//var app = express.createServer();

//app.get('/', function (req, res) {
//    res.send('Hello World');
//});

//app.listen(1337);