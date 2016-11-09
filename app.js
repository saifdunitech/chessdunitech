
var express = require('express'),
    http = require('http');
var _=require('underscore'); 
var app = express();
app.use(express.static('public'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/**
 * Get port from environment and store in Express.
 */
var port = process.env.PORT || 8080;
//var port = 1338;
app.set('port', port);

/**
 * Create HTTP server.
 */


var server = http.createServer(app);
//var server = app.listen();
//var http = require('http');
//var port = process.env.PORT || 8080;

var flakeIdGen = require('flake-idgen'), intformat = require('biguint-format'), generate = new flakeIdGen;
var id1 = generate.next();
var id2 = generate.next();
var id3=intformat(id1,'dec');
var id4 = intformat(id2, 'hex', { prefix: '0x' });

var connectedPlayers=new Array();
var UUID = require('node-uuid');

app.get('/', function (req, res) {
    //console.log(__dirname);
    res.sendFile(__dirname + '/public/default.html');
});

server.listen(port, function () {
    console.log('listening on *: ' + port);
});

var fs = require('fs');






var io = require('socket.io')(http).listen(server, { 'transports': ['websocket', 'polling'] });
//socketio.set('transports', ['websocket']);

//var uuid1 = uuid.v4(); // e.g. 32a4fbed-676d-47f9-a321-cb2f267e2918
//var uuid2 = uuid.v4(); // e.g. 8b68cf5b-d619-4281-b560-1578b0ee891d
var Elo1 = require('arpad');

var uscf = {
    default: 32,
    2100: 24,
    2400: 16
};

//var elo = new Elo1(uscf, 100);


var Elo2 = require('elo-js');

var elo = new Elo2();

var EloRating = require('elo-rating');


var mailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport")
// Use smtp protocal to send email
var smtpTransport = mailer.createTransport(smtpTransport({
    host : "108.170.59.102",
    secureConnection : false,
    port: 25,
    auth : {
        user : "support@btcglobal5.net",
        pass : "global!@123"
    }
}));





// setup my socket server


//var io = require('socket.io')(http);
var clients = [];
var usernames = {};
var rooms = new Array();
var onlineUsernames = [];

io.sockets.on('connection', function (socket) {



    socket.on('create', function (room) {
        socket.room = room;
        socket.join(room);
        //appendObject(room);
        rooms.push(room);
        console.log('create');
        updateroom();
    });


    socket.on('sendEmail', function (mailInfo) {
       
        var mail = {
            from: mailInfo.from,
            to: mailInfo.to,
            subject: mailInfo.subject,
            text: mailInfo.body,
            html: "<b>Please Click this Link to Play : "+mailInfo.body+"</b>"
        };
         
        smtpTransport.sendMail(mail, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response.response.toString());
                console.log("Message Sent Successfully :" + response.message);
        }       
            smtpTransport.close();

        });


      
    });



    //function appendObject(obj) {
       
    //    var configFile = [];
    //    configFile = fs.readFileSync('rooms.json');
    //    console.log(configFile);
    //    var config = [];
    //    if (configFile.length>0) {
         
    //        config = JSON.parse(configFile);
    //    }       
    //    config.push(obj);
    //    var configJSON = JSON.stringify(config);
    //    fs.writeFileSync('rooms.json', configJSON);
    //}

    function updateroom() {
        //  var configFile = [];
        // configFile = fs.readFileSync('rooms.json');
        // if (configFile.length > 0) {
        //     io.emit('updaterooms', JSON.parse(configFile), socket.rooms);
        // }
        io.emit('updaterooms', rooms, socket.rooms);
        }
    //function updateJsonRoomFile(room) {
    //    var configFile = [];
    //    configFile = fs.readFileSync('rooms.json');
    //    var tempRoom = JSON.parse(configFile);
    //    for (var i = 0; i < tempRoom.length; i++) {
    //        if (tempRoom[i].roomName == room.roomName) {
    //            tempRoom[i] = room;
    //            break;
    //        }
    //    }

    //    // _.extend(_.findWhere(JSON.parse(configFile), { roomName: room.roomName }), room);
    //    var configJSON = JSON.stringify(tempRoom);
    //    fs.writeFileSync('rooms.json', configJSON);
    //};


    socket.on('getRooms', function () {
        updateroom();
    });

    socket.on('tournament', function (tournametData) {
        console.log('tournament Game Started');
        io.emit('tournamentPlayGame', tournametData);
    });


    socket.on('joinRoom', function (room) {
        // socket.join(room);       
        //updateJsonRoomFile(room);

        _.extend(_.findWhere(rooms, { roomName: room.roomName }), room);
       

        console.log('joinRoom');
        //var player1Rating = 1200;
        //var player2Rating = 1250;

        //var newPlayer1Rating = elo.ifWins(player1Rating, player2Rating);
        //console.log("--------newPlayer1Rating---------");
        //console.log("newPlayer1Rating " + newPlayer1Rating);
        //console.log("--------newPlayer1Rating---------");
        //newPlayer1Rating = elo.ifLoses(player1Rating, player2Rating);
        //console.log("newPlayer1Rating " + newPlayer1Rating);
        //console.log("-------newPlayer1Rating----------");
        //newPlayer1Rating = elo.ifTies(player1Rating, player2Rating);
        //console.log("newPlayer1Rating " + newPlayer1Rating);
        //console.log("-----------------");

        //var playerWin = true;
        //var result = EloRating.calculate(1750, 1535, playerWin);

        //console.log(result.playerRating) // Output: 1735 
        //console.log("-----------------");
        //console.log(result.opponentRating) // Output: 1550 

        //console.log("-----------ratingDifference ------");

        //console.log(EloRating.ratingDifference(1500, 1350)); // Output: 150 
        //console.log("-------ratingDifference----------");
        //console.log(EloRating.ratingDifference(1200, 2000)); // Output: -400 

        //console.log("-------expected----------");
        //console.log(EloRating.expected(1800, 1800)); // Output: 0.5 
        //console.log("-------expected----------");
        //console.log(EloRating.expected(1500, 1350)); // Output: 0.70... 
        //console.log("-------expected----------");
        //console.log(EloRating.expected(1200, 2000)); // Output: 0.09... 



        //var alice = 2090;
        //var bob = 2700;

        //var odds_alice_wins = elo.expectedScore(alice, bob);
        //console.log("The odds of Alice winning are about:", odds_alice_wins); // ~2.9%
        //alice = elo.newRating(odds_alice_wins, 1.0, alice);
        //console.log("Alice's new rating after she won:", alice); // 2121

        //odds_alice_wins = elo.expectedScore(alice, bob);
        //console.log("The odds of Alice winning again are about:", odds_alice_wins); // ~3.4%
        //alice = elo.newRating(odds_alice_wins, 1.0, alice);
        //console.log("Alice's new rating if she won again:", alice); // 2144


        io.emit('joinCount', room);
    });





    socket.on('updateRoomFEN', function (room) {
        // socket.join(room);       
        _.extend(_.findWhere(rooms, { roomName: room.roomName }), room);
//
        //updateJsonRoomFile(room);

        console.log('updateRoom');
        updateroom();
    });



 


   // io.set('transports', ['websocket']);
    console.log('New connection');
    //console.log(socket.rooms);
    //lobby.add(socket);
    require('events').EventEmitter.prototype._maxListeners = 0;


    //io.sockets.on('connection', function (uid) {
    //   // console.log(uid+ ' '+uuid1);
    //    //console.log(uid + ' ' + uuid2);
    //});

    socket.userid = UUID();
    //console.info('New client connected (id=' + socket.id + ').');
    clients.push(socket);
    connectedPlayers.push({ "UserId": socket.userid, "SocketId": socket.id });
    //tell the player they connected, giving them their id

    io.emit('onconnected', { id: socket.userid, OnlinePlayer: connectedPlayers, SocketId: socket.id });
    //io.set('transports', ['websocket', 'flashsocket', 'polling']);

    //Useful to know when someone connects
    console.log('\t socket.io:: player ' + socket.userid + ' connected');
   
   
    //When this client disconnects
    socket.on('disconnect', function () {

        //Useful to know when someone disconnects
        console.log('\t socket.io:: client disconnected ' + socket.userid);
        
        onlineUsernames.splice(onlineUsernames.indexOf(socket.userid), 1);
        connectedPlayers.splice(connectedPlayers.indexOf(socket.userid),1);
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            //console.info('Client gone (id=' + socket.id + ').');
        }

        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
       

    }); //client.on disconnect


    socket.on('message', function(msg) {
        console.log('Got message from client: ' + msg);
    });
// Called when the client calls socket.emit('move')
    socket.on('moveOn', function (msg, roomDetails) {
        console.log('Got message from client moveOn: ' + msg);
        //socket.broadcast.to(emailid).emit('move', msg, emailid);
        //socket.emit('move', msg, emailid);
        _.extend(_.findWhere(rooms, { roomName: roomDetails.roomName }), roomDetails);

        //updateJsonRoomFile(roomDetails);

        socket.broadcast.emit('move', msg, roomDetails);
        
});
socket.on('startGame', function (emailid,msg) {
    console.log('Got message from client startGame:  ' + emailid + " " + msg);
    socket.to(emailid).emit('start', msg);
});
socket.on('restartGame', function (emailid,msg) {
    console.log('Got message from client clear restartGame: ' + emailid + " " + msg);
    socket.to(emailid).emit('restart', msg);
});
socket.on('restartGameConfirm', function (emailid, msg) {
    console.log('Got message from client clear restartGameConfirm: ' + emailid + " " + msg);
    io.emit('restartConfirm', msg);
});
socket.on('scheduleMatch', function (parentuserid,emailid, msg) {
    console.log('Got scheduleMatch from client scheduleMatch: ' + emailid + " Id: " + msg + 'parentuserid :' + parentuserid);
    //socket.broadcast.to(emailid).emit('myMatch', { msg: msg });
    var data = { UserId: msg, socketId: emailid, parentuserid: parentuserid };
    socket.to(emailid).emit('myMatch', { msg: data });

});


socket.on('join', function (data) {
    console.log('Got message from client join : ' + data.roomName);
    socket.join(data.roomName); // We are using room of socket io
});

socket.on('online', function () {
    console.log('Got message from client online');
    io.emit('onlineAll', { OnlinePlayer: connectedPlayers });
});

socket.on('onlineUser', function (data) {
    console.log('Got message from client onlineUser');
    //onlineUsernames.splice(onlineUsernames.indexOf(data.Username), 1);
    //onlineUsernames.splice(onlineUsernames.indexOf({ 'Username': data.Username }), 1);
    onlineUsernames.push(data);
    io.emit('sendOnlineUsers', { OnlineUsers: onlineUsernames });
});

socket.on('onlineData', function () {
    console.log('Got message from client onlineData');
    io.emit('sendOnlineUsers', { OnlineUsers: onlineUsernames });
});


    // Called when toss coin flip
    socket.on('flipcoin', function (msg, coinData) {

    });
  


});





