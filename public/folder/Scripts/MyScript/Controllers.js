/// <reference path="../../Chessboard/sdk.js" />
/// <reference path="../../Chessboard/sdk.js" />


chessApp.controller('ChessGameController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', 'DataService', '$timeout', '$rootScope', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, DataService, $timeout, $rootScope, userPersistenceService) {

    $scope.pop = function () {
        // toaster.pop("success", "title", "text");
        notifierService.notify("Hello Saif");
    };
    $scope.registerPlayer = function (playerdata) {
        //alert("Try");  
        if (angular.isDefined(playerdata))
            $scope.playerCount = _.where($scope.playerList, { EmailId: playerdata.EmailId });
        if (DataService.isEmpty(playerdata) || DataService.isEmpty(playerdata.Username) || DataService.isEmpty(playerdata.Password) || DataService.isEmpty(playerdata.EmailId)) {
            notifierService.notifyMessage('error', "Field are Empty", "Please fill all required fields ! ");
        }
        else if ($scope.playerCount.length > 0) {
            notifierService.notifyMessage('error', "Email Address", "This Email Address Alreay Exists ! ");
        }
        else {
            if (playerdata.Password == playerdata.Repassword) {
                $scope.param.Username = angular.lowercase(playerdata.Username);
                $scope.param = playerdata;
                $scope.param.Status = "1";
                $scope.param.Id = 0;
                $scope.param.IsDeleted = "true";
                delete $scope.param.Repassword;

                //$scope.URL = "http://localhost:2753/ChessDetailsService.svc";
                mainService.PostData("AddPlayer", $scope.param, 11)
                    .then(function (data) {
                        //alert(data);
                        if (data != null) {
                            $scope.playerList = {};
                            $scope.playerList = data.data.AddPlayerResult;
                            notifierService.notifyRegister(" ", $scope.param.Username + " account successfully registered !");
                            $scope.player = {};
                        }
                        //you will get "data" as a response from service
                    }, function (err) {
                        // $log.error('failure loading player', error);
                        // notifierservice.notifyerror();
                        alert(err);
                        console.log("some error occured." + err);
                    });
                //var promisePost = ChessGameService.post($scope.URL, $scope.param);
                //promisePost.then(function (pl) {
                //    if (pl.data) 
                //        notifierService.notifyRegister(" ", $scope.param.Username + " Account Successfully Registered ! ");
                //}, function (err) {
                //    notifierService.notifyError();
                //    console.log("Some error Occured" + err);
                //});

            }
            else {
                notifierService.notifyMessage("error", "Password Matching", "Password and Re-type Password Does not Matched. !");

            }
        }
    }
    $scope.getAllPlayer = function () {
        $scope.URL = "GetPlayers";
        //mainService.GetDataPlayers($scope.URL)
        //        .then(function (data) {
        //            //alert(data);
        //            if (data != null) {
        //                $scope.playerList =data.GetAllPlayerResult;
        //                //notifierService.notifyRegister($scope.param.Username + " Account Successfully Registered !");
        //            }
        //            //You will get "data" as a response from service
        //        }, function (error) {
        //            $log.error('failure loading Player', error);
        //            notifierService.notifyError();
        //        });

        $scope.param = {};
        $scope.param.Status = "15";
        $scope.param.Id = 0;
        $scope.param.IsDeleted = "true";
        var promiseGet = mainService.GetDataPlayers($scope.URL);
        promiseGet.then(function (pl) {
            $scope.playerList = pl.data.ManagePlayerResult;
        },
              function (errorPl) {
                  notifierService.notifyError();
                  $log.error('Some Error in Getting Records.', errorPl);
              });
    };

    $scope.init = function () {
        $scope.player = {
        };
        $scope.playerList = {};
        $scope.playerCount = 0;
        $scope.getAllPlayer();
        $rootScope.$on("GetPlayer", function () {
            $scope.getAllPlayer();
        });

    }



}]);

chessApp.controller('ChessConnectionController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$timeout', '$rootScope', '$compile', '$state', 'userPersistenceService', '$interval', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $timeout, $rootScope, $compile, $state, userPersistenceService, $interval) {
    $scope.init = function () {
        //$scope.chessboardSystem.position($rootScope.fenPosition);
        var socket = "";
        $rootScope.$emit("GetPlayer");
        $scope.allPlayerOnline = [];
        $scope.userIdOne = undefined;
        $scope.userOne = undefined;
        $scope.userTwo = undefined;
        $scope.userIdTwo = undefined;
        $scope.startmatch = false;
        $scope.onlinePlayer = "";
        $scope.isDisabledClient = false;
        $scope.onlinePlayer = [];
        $rootScope.socket.emit('onlineData');

        $scope.onlinePlayer = userPersistenceService.getChessResponse();
        $scope.clock = "loading clock..."; // initialise the time variable
        $scope.tickInterval = 1000 //ms

        $scope.timerRunning = true;
        var temp = {};
        temp.UserId = localStorage.getItem("UserId");
        getChessTableSetupData(temp, 12);
        $scope.tableConfig = {};
        $scope.tableSetupDetails = {};
        $scope.counter = 0;
        $scope.counterMin = 0;
        $scope.counterSec = 0;
 
    };

    function getplayers() {
        var promiseGet = mainService.GetDataPlayers("GetPlayers");
        promiseGet.then(function (pl) {
            $scope.playerList = pl.data.ManagePlayerResult;
        },
              function (errorPl) {
                  notifierService.notifyError();
                  $log.error('Some Error in Getting Records.', errorPl);
              });
    };
    getplayers();

    $scope.mytestAlert = function () {
        //bootbox.alert("Your message here…");
        // bootbox.confirm("Are you sure?", function (result) { /* your callback code */ })
        bootbox.prompt({
            title: "This is a prompt with a number input!",
            inputType: 'number',
            callback: function (result) {
                console.log(result);
            }
        });
    };



    $interval(function () {
        $scope.date = new moment().format('hh:mm:ss a');
    }, 1000);


    $scope.$watch('onlinePlayer', function (newVal, OldVal) {
        if (angular.isDefined(newVal)) {
            if (newVal) {
                $timeout(function () {
                    $scope.onlinePlayer = _.without($scope.onlinePlayer, _.findWhere($scope.onlinePlayer, { UserId: $scope.userId }, false));
                }, 200);
            }
        }
    });





    $scope.scheduleMatch = function (userid, socketid) {
        //var tableData = $("#matchBoard");


        $scope.startmatch = true;
        $scope.isDisabledClient = true;
        $("#match").empty();
        //$scope.template = '<span data-ng-if="userTwo!=null" style="font-weight:bold;">{{userTwo}} - {{userIdTwo}}</span><div id="{{socketId}}" style="width: 400px"  ></div><input type="submit" id="Submit1" value="Start" data-ng-click="startGame()" /><input type="submit" id="Submit2" value="Clear" data-ng-click="clearGame()" /><input type="submit" id="Submit3" value="Flip Board" data-ng-click="flipBoard()" /><span  data-ng-if="userOne!=null" style="font-weight:bold;">{{userOne}} - {{userIdOne}}</span><p>Status: <span id="Span1"></span></p><p>FEN: <span id="Span2"></span></p><p>PGN: <span id="Span3"></span></p>';
        // angular.element(document.body).append($scope.template);
        //var myData = "<span data-ng-if='userTwo!=null' style='font-weight:bold;'>{{userTwo}} - {{userIdTwo}}</span><div data-ng-init='init()' id='"+$scope.userId+"' style='width: 400px'  ></div><input type='submit' id='startGame' value='Start' data-ng-click='startGame()' /><input type='submit' id='stopGame' value='Clear' data-ng-click='clearGame()' /><input type='submit' id='flipBoard' value='Flip Board' data-ng-click='flipBoard()' /><span  data-ng-if='userOne!=null' style='font-weight:bold;'>{{userOne}} - {{userIdOne}}</span><p>Status: <span id='status'></span></p><p>FEN: <span id='fen'></span></p><p>PGN: <span id='pgn'></span></p>";
        //var myData = '<div data-ng-if='+$scope.userIdTwo!=null+' chess-board chessboardid='+$scope.userIdTwo+'></div>';
        //var body = angular.element(document.getElementById("match"));
        //body.append(myData);

        //$compile(body)($scope);


        localStorage.removeItem("socketId");
        localStorage.setItem("socketId", socketid);
        localStorage.removeItem("parentuserid");
        localStorage.setItem("parentuserid", $rootScope.socket.id);

        $rootScope.socket.emit('scheduleMatch', $rootScope.socket.id, socketid, userid);
        //$state.go('Game', { UserId: userid });
        //$state.go('Game',);
        //_.defer(function () {
        //    $scope.$apply();
        //});


        $scope.add5Seconds = function () {
            alert('5');
            // $scope.$broadcast('timer-add-cd-seconds', 5);

        };
        $scope.check = function () {
            alert('Hi');
        };

    };





    $rootScope.$on('AllPlayers', function (event, playersData, OnlineUsername) {
        $scope.username = OnlineUsername;
        $scope.allPlayerOnline = playersData;
        if (angular.isDefined($scope.onlinePlayer))
            $scope.onlinePlayer = $scope.onlinePlayer[$scope.onlinePlayer.length - 1].Username = OnlineUsername;
        $scope.allPlayeFilterOnline = _.without($scope.allPlayerOnline, _.findWhere($scope.allPlayerOnline, { Username: $scope.username }, false));
    });

    $rootScope.$on('connection', function (event, datascope, data1) {
        $rootScope.socket = datascope;
        $scope.socketId = datascope.id;
        $scope.dataFromController = data1;
        $scope.onlinePlayer = data1.OnlinePlayer;
        userPersistenceService.saveUserSocketDataResponse(data1);
        userPersistenceService.saveChessResponse(data1.OnlinePlayer);

        //$timeout(function () {
        //   $scope.init();
        //}, 3000);
    });
    $rootScope.socket.on('sendOnlineUsers', function (msg) {
        var username = localStorage.getItem("Username");
        $scope.onlineUserData = {};
        // $scope.onlineUserData = msg.OnlineUsers;
        $scope.onlineUserData = _.without(msg.OnlineUsers, _.findWhere(msg.OnlineUsers, { Username: username }, false));

    });

    //$interval(function () {
    //    $rootScope.socket.emit('onlineData');
    //}, 1000, true);

    // $scope.$emit('reloadConnection');


    $scope.startTimer = function () {
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };

    $scope.stopTimer = function () {
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
    };


    var stopped;

    //timeout function
    //1000 milliseconds = 1 second
    //Every second counts
    //Cancels a task associated with the promise. As a result of this, the //promise will be resolved with a rejection.  
    $scope.countdown = function () {
        stopped = $timeout(function () {
            //console.log($scope.counter);
            $scope.counter--;
            $scope.counterMin = Math.trunc($scope.counter / 60);
            $scope.counterSec = $scope.counter % 60;
            $scope.countdown();
        }, 1000);
    };


    $scope.stop = function () {
        $timeout.cancel(stopped);

    }



    function getChessTableSetupData(setupData, action) {

        mainService.setupChessTable("tableSetup", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $timeout(function () {
                          $scope.tableSetupDetails = data.data.manageChessSetupDetailsResult;
                          $scope.tableConfig = _.findWhere($scope.tableSetupDetails, { IsDefault: true });
                          if (angular.isDefined($scope.tableConfig)) {
                              $scope.tableConfig.secondsTotalTimeLimit = $scope.tableConfig.TotalTimeLimit;
                              $scope.counter = $scope.tableConfig.secondsTotalTimeLimit;
                          }
                          //$scope.$broadcast('timer-add-cd-seconds', $scope.tableConfig.secondsTotalTimeLimit);
                      }, 250);
                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };


}]);

chessApp.controller('ChessBoardController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$timeout', '$rootScope', '$state', '$stateParams', '$interval', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $timeout, $rootScope, $state, $stateParams, $interval, userPersistenceService) {
    function pieceTheme(piece) {
        // wikipedia theme for white pieces
        if (piece.search(/w/) !== -1) {
            return 'img/chesspieces/wikipedia/' + piece + '.png';
        }

        // alpha theme for black pieces
        return 'img/chesspieces/alpha/' + piece + '.png';
    }
   
    $scope.init = function () {
        var u = localStorage.getItem("Username");
        if (!angular.isDefined(u))
            $state.go('Login');

        $scope.chessSettings = {
            snapbackSpeed: 550,
            appearSpeed: 1500,
            draggable: true,
            showNotation: false,
            dropOffBoard: 'snapback',
            onDragStart: onDragStartFunction,
            onDrop: onDragFunction,
            OnSnapEnd: onSnapEndFunction,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
            pieceTheme: pieceTheme
            //pieceTheme: 'http://www.willangles.com/projects/chessboard/img/chesspieces/wikipedia/{piece}.png'
        };

        $rootScope.myMatchStart = false;
        //$rootScope.$emit('connectivity');
        var cookies = {};
        $scope.playerType = {};
        //$scope.chessboardSystem = ChessBoard($("#Div1"), $scope.chessSettings);
        //$scope.chessboardSystem.position($rootScope.fenPosition);
        var socket = "";
        $rootScope.$emit('connectivity');
        $rootScope.$emit("GetPlayer");
        //$scope.startmatch = false;
        $scope.chessBoardTable = [];
        //$scope.chessboardSystem = ChessBoard($("#" + id + ""), $scope.chessSettings);
        //angular.forEach($scope.onlinePlayer, function (item) {
        //    bindBoard("chessboard");
        //});
        $scope.UserIdNewParams = $stateParams.UserId;
        //$scope.myMatchStart = false;
        $scope.onlinePlayer = userPersistenceService.getChessResponse();

        $rootScope.socket.emit('getRooms');
        $scope.isPageLoad = true;
        $scope.tableSetupSettings = {};
        //$scope.tableSetupSettings = userPersistenceService.getuserSetupSettings();
        //if($scope.tableSetupSettings==null)
        //$scope.tableSetupSettings = JSON.parse(localStorage.getItem("tableSetupSettings"));
        $rootScope.$emit('chessTableSetup');
        $scope.counter = 0;
        $scope.counterMin = 0;
        $scope.counterSec = 0;
        $scope.filterRoom = {};
        $scope.avaiableRooms = {};
        $scope.totalRooms = {};
        $scope.RoomCreatedBy = undefined;
        $scope.filterRoom.whiteUserTime = 0;
        $scope.filterRoom.blackUserTime = 0;
        var game = new Chess();
        game.clear(true);

        $scope.pointDetails = {};
        var temp = {};
        temp.UserId = 1;
        getChessTablePoint(temp, 12);
        $scope.userTimeOut = false;


    };





    $scope.joinRoom = function (roomName) {

        var temp = _.findWhere($scope.rooms, { roomName: angular.lowercase(roomName.roomName) });
        // if (angular.isUndefined(temp)) {
        $rootScope.roomName = roomName.roomName;
        temp = roomName;
        if (temp.PlayerBlack == "") {
            if (temp.UserIdWhite != localStorage.getItem("UserId") && temp.UserIdBlack != localStorage.getItem("UserId")) {
                temp.PlayerBlack = angular.lowercase(localStorage.getItem("Username"));
                temp.isAvaiable = false;
                temp.UserIdBlack = localStorage.getItem("UserId");

                //angular.forEach($scope.allRooms, function (item) {
                //    if (angular.lowercase(item.roomName) == angular.lowercase(roomName.roomName)) {             
                //        item.PlayerBlack = localStorage.getItem("Username");
                //        item.isAvaiable = false;
                //        item.UserIdBlack = localStorage.getItem("UserId");
                //    }
                //});
                //roomName.PlayerBlack = localStorage.getItem("Username");
                $rootScope.socket.emit('joinRoom', roomName, $scope.allRooms);
            } else {
                $state.go('Game', { UserId: temp.roomId });
            }
        } else {
            $state.go('Game', { UserId: temp.roomId });
        }
        //} else {
        //     notifierService.notifyMessage("error", "You are Already Avaiable: ", roomName.roomName + " It is your created Lobby.!");

        //  }
    };

    $rootScope.socket.on('joinCount', function (data) {
        var value = data;
        if (angular.lowercase(value.PlayerWhite) == angular.lowercase(localStorage.getItem("Username"))) {
            $state.go('Game', { UserId: value.roomId });
            $timeout(function () {
                $rootScope.$emit('roomDataEvent', value);
            }, 250);
        } else if (angular.lowercase(value.PlayerBlack) == angular.lowercase(localStorage.getItem("Username"))) {
            $state.go('Game', { UserId: value.roomId });
            $timeout(function () {
                $rootScope.$emit('roomDataEvent', value);
            }, 250);
        }


    });
    //$scope.$on('socketData', function (data) {
    //    $rootScope.socket = data.currentScope.socket;
    //});

    $scope.$watch('UserIdNewParams', function (newVal, OldVal) {
        if (angular.isDefined(newVal)) {
            if (newVal) {
                $timeout(function () {
                    bindBoard($scope.UserIdNewParams);

                }, 200);
            }
        }
    });

    function restart() {
        game.clear(true);
        game.reset();
        $scope.chessboardSystem.clear();
        $scope.chessboardSystem.start();

        $timeout(function () {
            updateStatusFunction();

        }, 250);

    };

    function bindBoard(id) {
        //restart();
        game.reset(true);
        game.clear();
        game.fen();

        $scope.filterRoomtemp = {};
        $scope.filterRoom = _.where($scope.allRooms, { roomId: $scope.UserIdNewParams }, true)[0];
        if ($scope.filterRoom != null) {
            $scope.filterRoomtemp = $scope.filterRoom;
            $rootScope.roomName = $scope.filterRoom.roomName;
            if ($scope.filterRoom != null && $scope.filterRoom.PlayerBlack == "") {

                //$scope.filterRoom.PlayerBlack = angular.lowercase(localStorage.getItem("Username"));
                //$scope.filterRoom.isAvaiable = false;
                //$scope.filterRoom.UserIdBlack = localStorage.getItem("UserId");
                bootbox.prompt({
                    title: "Please Guess Coin: Heads : 1 or Tail: 2",
                    inputType: 'number',
                    callback: function (result) {
                        var coin = (parseInt(result) == 1) ? "heads" : "tails";
                        if ($scope.filterRoom.tossCoin == coin) {
                            $scope.filterRoom.PlayerBlack = $scope.filterRoomtemp.PlayerWhite;
                            $scope.filterRoom.UserIdBlack = $scope.filterRoomtemp.UserIdWhite;
                            $scope.filterRoom.PlayerWhite = localStorage.getItem("Username");
                            $scope.filterRoom.UserIdWhite = localStorage.getItem("UserId");

                        } else {
                            $scope.filterRoom.PlayerBlack = localStorage.getItem("Username");
                            $scope.filterRoom.UserIdBlack = localStorage.getItem("UserId");
                        }
                        _.extend(_.findWhere($scope.allRooms, { roomName: $scope.filterRoom.roomName }), $scope.filterRoom);
                        $rootScope.socket.emit('joinRoom', $scope.filterRoom, $scope.allRooms);
                        $rootScope.socket.emit('updateRoomFEN', $scope.filterRoom);
                        loadChessBoard();
                    }
                });



            } else {

                loadChessBoard();
            }
        }
        //game.reset();
    };

    function loadChessBoard() {

        $scope.chessboardSystem = {};
        $scope.chessboardSystem = ChessBoard($("#" + $scope.UserIdNewParams), $scope.chessSettings);
        //$(window).resize($scope.chessboardSystem.resize);
        $timeout(function () {
            $scope.filterRoom = _.where($scope.allRooms, { roomId: $scope.UserIdNewParams }, true)[0];

            if (angular.isDefined($scope.filterRoom)) {
                $rootScope.$emit('roomDataEvent', $scope.filterRoom);
                if (angular.isUndefined($scope.filterRoom.whiteUserTime) || $scope.filterRoom.whiteUserTime == 0) {
                    $scope.whitecounter = $scope.filterRoom.TotalTableTimeLimit;
                    $scope.blackcounter = $scope.filterRoom.TotalTableTimeLimit;
                } else {
                    $scope.whitecounter = $scope.filterRoom.whiteUserTime;
                    $scope.blackcounter = $scope.filterRoom.blackUserTime;
                }
                // $scope.whitecounter = $scope.filterRoom.TotalTableTimeLimit;


                $scope.RoomName = $scope.filterRoom.RoomName;
                $scope.RoomCreatedBy = $scope.filterRoom.PlayerWhite;

                restart();
                if (!$scope.isPageLoad)
                    saveBoardResult();
            }
        }, 100);
    };

    //$(window).resize($scope.chessboardSystem);
    //$rootScope.$on('connection', function (event, datascope,data1) {
    //    $rootScope.socket = datascope;
    //    $scope.onlinePlayer = data1.onlinePlayer;

    //});



    function updateFENDetailsGame(data, action) {
        mainService.updateGameDetailsOfPlayer("updateGameDetails", data, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.gameDetails = {};
                      $scope.gameDetails = data.data.updateGameDetailsResult;
                      // notifierService.notifyRegister(" ", $scope.param.Username + " account successfully registered !");
                      //$scope.player = {};
                      //alert('Updated');
                      //$state.reload();
                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert('some error occured');
                  console.log("some error occured." + err);
              });
    }






    $scope.startGame = function () {

        //$('#startGame').on('click', $scope.chessboardSystem.start);
        //$rootScope.socket.emit('generate_uuid', 'My Id: ')


        restart();
        if ($rootScope.myMatchStart == true) {
            $scope.selectUserSocketId = localStorage.getItem("parentuserid");
        }
        else {
            $scope.selectUserSocketId = localStorage.getItem("socketId");
        }
        $rootScope.socket.emit('startGame', $scope.selectUserSocketId, true);
    };
    $scope.clearGame = function () {
        //$('#stopGame').on('click', $scope.chessboardSystem.clear); 

        if ($rootScope.myMatchStart == true) {
            $scope.selectUserSocketId = localStorage.getItem("parentuserid");
        }
        else {
            $scope.selectUserSocketId = localStorage.getItem("socketId");
        }
        $rootScope.socket.emit('restartGame', $scope.selectUserSocketId, true);

    };

    $scope.flipBoard = function () {
        $scope.chessboardSystem.flip();
    };


    function goodbye(e) {
        if (!e) e = window.event;
        //e.cancelBubble is supported by IE - this will kill the bubbling process.
        e.cancelBubble = true;
        e.returnValue = 'You sure you want to leave?'; //This is displayed on the dialog

        //e.stopPropagation works in Firefox.
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        //$rootScope.socket.close();
        //$rootScope.socket.emit('updateRoomFEN', d);
    }
    window.onbeforeunload = goodbye;

    /* Allow only Legal Moves of the Chess Board  */

    var game = new Chess(), statusE1 = $("#status"),
     fenE1 = $("#fen"),
     pgnE1 = $("#pgn");
    game.header('White', 'Morphy', 'Black', 'Anderssen', 'Date', '1858-09-12');
    game.clear(true);
    game.reset(true);
    //do not pick up pieces if game is over



    var onDragStartFunction = function (source, piece, position, orientation) {

        var dRoom = _.findWhere($scope.allRooms, { roomId: $scope.UserIdNewParams });

        //var dRoom = $scope.filterRoom;

        var d = (piece.search(/^b/) === -1) ? 'White' : 'Black';
        //console.log("Drag started:");
        //console.log("Source: " + source);
        //console.log("Piece: " + piece);
        //console.log("Position: " + $scope.chessboardSystem.fen());
        //console.log("Orientation: " +  d );
        //console.log("--------------------");
        $scope.piece = piece;

        if ($rootScope.myMatchStart == true) {
            $scope.selectUserSocketId = localStorage.getItem("parentuserid");
        }
        else {
            $scope.selectUserSocketId = localStorage.getItem("socketId");
        }
        if (!angular.isDefined(dRoom.UserIdWhite) && game.turn() === 'w') {
            dRoom.UserIdWhite = localStorage.getItem("UserId");
        }
        if (dRoom.UserIdWhite == localStorage.getItem("UserId") || dRoom.UserIdBlack == localStorage.getItem("UserId")) {
            if (game.game_over() == true || (game.turn() === 'w' && piece.search(/^b/) !== -1) || (dRoom.UserIdWhite == localStorage.getItem("UserId") && game.turn() === 'b') || (dRoom.UserIdBlack == localStorage.getItem("UserId") && game.turn() === 'w') ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            } else {

            }
        } else {
            return false;
        }
        //console.log(userPersistenceService.getCookieData("boardType") + $scope.selectUserSocketId);



    };


    var removeGreySquares = function () {
        $('#' + $scope.UserIdNewParams + ' .square-55d63').css('background', '');
    };

    var onDragFunction = function (source, target) {
        //see moves is legal
        removeGreySquares();
        $scope.isPageLoad = false;
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        if (move === null) { return 'snapback'; }
        else {
            if ($rootScope.myMatchStart == true) {
                $scope.selectUserSocketId = localStorage.getItem("parentuserid");
            }
            else {
                $scope.selectUserSocketId = localStorage.getItem("socketId");
            }
            // movePeice(move);
            //$rootScope.socket.emit('moveOn', $scope.selectUserSocketId, move);
            $scope.to = move.to;
            var d = _.findWhere($scope.allRooms, { roomId: $scope.UserIdNewParams });
            // var d = $scope.filterRoom;
            if (game.turn() !== 'w')
                d.whiteMoves = d.whiteMoves + 1;
            else
                d.blackMoves = d.blackMoves + 1;

            if (!angular.isDefined(d.moveHistory)) {
                d.moveHistory = [];
                d.totalWitePlayerPoints = 0;
                d.totalBlackPlayerPoints = 0;
            }
            if (angular.isDefined(move.captured) && move.color == 'b') {
                switch (move.captured) {
                    case "p":
                        d.totalBlackPlayerPoints += $scope.pointDetails.pawn;
                        break;
                    case 'n':
                        d.totalBlackPlayerPoints += $scope.pointDetails.knight;
                        break;
                    case 'b':
                        d.totalBlackPlayerPoints += $scope.pointDetails.bishop;
                        break;
                    case 'r':
                        d.totalBlackPlayerPoints += $scope.pointDetails.rook;
                        break;
                    case 'q':
                        d.totalBlackPlayerPoints += $scope.pointDetails.queen;
                        break;
                    default:
                        break;

                }
            } else if (angular.isDefined(move.captured) && move.color == 'w') {
                switch (move.captured) {
                    case "p":
                        d.totalWitePlayerPoints += $scope.pointDetails.pawn;
                        break;
                    case 'n':
                        d.totalWitePlayerPoints += $scope.pointDetails.knight;
                        break;
                    case 'b':
                        d.totalWitePlayerPoints += $scope.pointDetails.bishop;
                        break;
                    case 'r':
                        d.totalWitePlayerPoints += $scope.pointDetails.rook;
                        break;
                    case 'q':
                        d.totalWitePlayerPoints += $scope.pointDetails.queen;
                        break;
                    default:
                        break;

                }
            }
            if (d.whiteMoves == 1 && d.blackMoves == 0)
                saveBoardResult();
            var te = $scope.pointDetails;

            d.moveHistory.push(move);
            $rootScope.socket.emit('moveOn', move, d);

        }
        updateStatusFunction();
    };


    var onSnapEndFunction = function () {
        $scope.chessboardSystem.position(game.fen());
    };


    var onMouseoutSquare = function (square, piece) {
        removeGreySquares();
    };

  

    var onMouseoverSquare = function (square, piece) {
        //get list of possible moves for this square
        var moves = game.moves({
            square: square,
            varbose: true
        });
        // exit if there are no moves available for this square
        if (moves.length === 0) return;

        // highlight the square they moused over
        greySquare(square);

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    };

    var greySquare = function (square) {
        var sub=square;
        var squareE1 = $('#' + $scope.UserIdNewParams + ' .square-' + square);
        var background = '#a9a9a9';
        if (squareE1.hasClass('black-3c85d') ===true) {
            background = '#696969';
        }
        squareE1.css('background', background);
    };



    var updateStatusFunction = function () {

        boardUpdate();
        var d = _.findWhere($scope.allRooms, { roomId: $scope.UserIdNewParams });
        var status = '';
        var moveColor = 'White';
        if (game.turn() === 'b') {
            moveColor = 'Black';
            $scope.countdownBlack();
            $timeout.cancel(stoppedWhite);

        } else {
            $scope.countdownWhite();
            $timeout.cancel(stoppedBlack);
        }
        $scope.FEN = game.fen();
        fenE1.html(game.fen());
        pgnE1.html(game.pgn());
        //verify checkmate status
        if (game.in_checkmate() === true) {
            status = 'Game Over, ' + moveColor + ' is in Checkmate.';
            notifierService.notifyMessage("info", "Checkmate", "Game Over, " + moveColor + " is in Checkmate. !");
            if (game.turn() === 'b') {
                $scope.gameStatus = 'White Wins';
                d.totalWitePlayerPoints += $scope.pointDetails.winningPoints;

            } else {
                $scope.gameStatus = 'Black Wins';
                d.totalBlackPlayerPoints += $scope.pointDetails.winningPoints;
            }

            if (d.totalBlackPlayerPoints > d.totalWitePlayerPoints) {
                $scope.gameStatus = 'Black';
                // alert('Black is Winner !!');

            } else if (d.totalWitePlayerPoints > d.totalBlackPlayerPoints) {
                //alert('White is Winner !!');
                $scope.gameStatus = 'White';
            }
            $timeout.cancel(stoppedWhite);
            $timeout.cancel(stoppedBlack);
            if (!$scope.isPageLoad && d.UserIdWhite == localStorage.getItem("UserId") || d.UserIdBlack == localStorage.getItem("UserId"))
                saveBoardResult();


        }
            //draw condition
        else if (game.in_draw() === true) {
            status = 'Game over, drawn position';
            notifierService.notifyMessage("info", "Game Drawn", "Game over, drawn position !");
            var drawData = $scope.pointDetails.winningPoints / 2;
            d.totalWitePlayerPoints += drawData;
            d.totalWitePlayerPoints += drawData;

            if (game.turn() === 'b') {
                $scope.gameStatus = 'White drawn';


            } else {
                $scope.gameStatus = 'Black drawn';

            }
            $timeout.cancel(stoppedWhite);
            $timeout.cancel(stoppedBlack);
            if (d.UserIdWhite == localStorage.getItem("UserId") || d.UserIdBlack == localStorage.getItem("UserId"))
                saveBoardResult();

        }
            //game is still on
        else {
            status = moveColor + ' to move now';
            if (game.in_check() === true) {
                if (game.turn() === 'b') {
                    moveColor = 'Black';
                    $(".square-55d63 .black-3c85d .square-" + $scope.to).addClass('in-check');
                } else {
                    $(".square-55d63 .white-1e1d7 .square-" + $scope.to).addClass('in-check');
                }
                status += ', ' + moveColor + ' is in Check now';
                notifierService.notifyMessage('error', "Check Status", status + " !");
            }

        }
        if (angular.isDefined(d)) {
            //var d = $scope.filterRoom;
            statusE1.html(status + ' : ' + d.whiteMoves + ' : ' + d.blackMoves);
            $scope.history = d.moveHistory;
            $scope.historyCapture = _.where($scope.history);
            $scope.whitePoint = d.totalWitePlayerPoints;
            $scope.blackPoint = d.totalBlackPlayerPoints;
            $scope.isYourMove = (d.whiteMoves == d.blackMoves) ? true : false;

        }
        $(".scroll_this_cont").mCustomScrollbar("update");
        $timeout(function () {
            $(".scroll_this_cont").mCustomScrollbar("scrollTo", "bottom");
        }, 150);

        //$rootScope.fenPosition = game.fen();

    };

    function saveBoardResult() {
        var gameData = {};
        gameData.TableId = $scope.UserIdNewParams;
        var d = _.findWhere($scope.allRooms, { roomId: $scope.UserIdNewParams });
        //var d = $scope.filterRoom;
        if (angular.isDefined(d)) {
            $scope.RoomName = d.roomName;
            gameData.RoomName = $scope.RoomName;
            gameData.UserIdWhite = d.UserIdWhite;
            gameData.UserIdBlack = d.UserIdBlack;
            gameData.GameStatus = $scope.gameStatus;
            gameData.WhitePoint = d.totalWitePlayerPoints;
            gameData.BlackPoint = d.totalBlackPlayerPoints;

            $scope.FEN = game.fen();
            gameData.FEN = $scope.FEN;
            d.FEN = gameData.FEN;

            gameData.whiteMoves = d.whiteMoves;
            gameData.blackMoves = d.blackMoves;
            gameData.roundNo = d.RoundNo;
            gameData.T_Id = d.T_Id;
            gameData.whiteTotalTime = $scope.whitecounter;
            gameData.blackTotalTime = $scope.blackcounter;
            gameData.winningMethod = $scope.winningMethod;

            gameData.moveHistory = "";
            if (d.moveHistory != null) {
                angular.forEach(d.moveHistory, function (h) {
                    angular.forEach(h, function (moveData) {
                        gameData.moveHistory += moveData + "+";
                    });
                    gameData.moveHistory += ",";
                });
                // gameData.moveHistory.slice(0, gameData.moveHistory.lastIndexOf(","));
            }


            updateFENDetailsGame(gameData, 11);

        }
    };

    function boardUpdate() {
        // $timeout(function () {
        var gameData = {};
        gameData.TableId = $scope.UserIdNewParams;
        var d = _.findWhere($scope.allRooms, { roomId: $scope.UserIdNewParams });
        // var d = $scope.filterRoom;
        if (angular.isDefined(d)) {
            $scope.RoomName = d.roomName;
            gameData.RoomName = $scope.RoomName;
            gameData.UserIdWhite = d.UserIdWhite;
            gameData.UserIdBlack = d.UserIdBlack;
            gameData.GameStatus = $scope.gameStatus;
            if (!$scope.isPageLoad) {
                $scope.FEN = game.fen();
                gameData.FEN = $scope.FEN;
                d.FEN = gameData.FEN;
                //updateFENDetailsGame(gameData, 11);
                //$rootScope.socket.emit('updateRoomFEN', d);                
                $rootScope.socket.emit('updateRoomFEN', d);

            }

            else {
                //updateFENDetailsGame(gameData, 12);
                //  $timeout(function () {

                if (angular.isDefined(d)) {
                    if (d.FEN == "")
                        d.FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
                    $scope.chessboardSystem.position(d.FEN);
                    game = new Chess(d.FEN);

                    //updateStatusFunction();
                }

                //  }, 150);// fen is the board layout
            }
        }

        // }, 200);
    };

    /*End Legal Moves Scripts*/

    function getRoomDetails() {
        if (angular.isDefined($scope.gameDetails)) {
            var temp = _.findWhere($scope.allRooms, { roomName: $scope.gameDetails[0].RoomName });
            $scope.RoomName = temp.roomName;
        }
    }

    // updateStatusFunction();

    function movePeice(msg) {
        game.move(msg);
        $scope.chessboardSystem.position(game.fen()); // fen is the board layout 
        updateStatusFunction();
    };



    $rootScope.socket.on('myMatch', function (data) {
        console.log('Connected successfully to myMatch');
        if (confirm('Second Player Wants to Play the Game. Do you want ?') == true) {
            //alert(data.msg.UserId);
            // $("#matchBoard").html(data.msg);
            //$scope.chessBoardTable.push({ path: "folder/Templates/chess.htm" }); 
            localStorage.removeItem("socketId");
            localStorage.setItem("socketId", data.msg.socketId);
            localStorage.removeItem("parentuserid");
            localStorage.setItem("parentuserid", data.msg.parentuserid);

            $state.go('Game', { UserId: data.msg.UserId });



            $scope.startmatch = true;
            $scope.UserId = data.msg.UserId;
            $timeout(function () {
                $rootScope.myMatchStart = true;
                $scope.userIdOne = data.msg.socketId;
                $scope.userOne = "White";
                $scope.userTwo = "Black";
                $scope.userIdTwo = data.msg.parentuserid;
            }, 250);


        } else {

        }
        // $scope.selectUserSocketId = localStorage.getItem("socketId");
        // $state.reload();
        //bindBoard($scope.UserId);
        console.log('Connected successfully to the client myMatch');
    });


    // called when the server calls socket.broadcast('move')
    $rootScope.socket.on('move', function (msg, roomDetails) {
        if (roomDetails.UserIdWhite == localStorage.getItem("UserId") || roomDetails.UserIdBlack == localStorage.getItem("UserId") && roomDetails.roomId == $scope.UserIdNewParams) {
            _.extend(_.findWhere($scope.allRooms, { roomName: roomDetails.roomName }), roomDetails);
            $scope.isPageLoad = false;
            movePeice(msg);
            userPersistenceService.clearCookieData("boardType");
            //.setCookieData("boardType", emailid);

        } else {
            $rootScope.socket.emit('getRooms');
            $timeout(function () {
                boardUpdate();
                updateStatusFunction();
            }, 250);
        }
    });
    $rootScope.socket.on('start', function (msg) {
        if (msg == true) {
            console.log('Connected successfully to start');
            restart();

        }
    });

    $rootScope.socket.on('restartConfirm', function (msg) {
        if (msg == true) {
            console.log('Connected successfully to restartConfirm');
            restart();
        }
    });


    $rootScope.socket.on('restart', function (msg) {
        if (msg == true) {
            console.log('Connected successfully to restart');
            if (confirm('Second Player Wants to Restart the Game. Are you sure ?') == true) {
                restart();
                if ($rootScope.myMatchStart == true) {
                    $scope.selectUserSocketId = localStorage.getItem("parentuserid");
                }
                else {
                    $scope.selectUserSocketId = localStorage.getItem("socketId");
                }
                $rootScope.socket.emit('restartGameConfirm', $scope.selectUserSocketId, true);
            }
            else {

            }
        }
    });


    //$rootScope.$emit('reloadConnection');


    $rootScope.$on('roomDataEvent', function (event, room) {

        if (angular.isDefined(room)) {
            $scope.roomDetails = room;
            $scope.RoomName = room.roomName;
            $scope.userIdOne = $scope.roomDetails.PlayerWhite;
            $scope.userOne = "White";
            $scope.userTwo = "Black";
            $scope.userIdTwo = $scope.roomDetails.PlayerBlack;
        }

    });

    $rootScope.$on('roomAll', function (event, room) {
        $scope.allRooms = room;
    });
    $rootScope.socket.on('updaterooms', function (data, room) {
        var username = localStorage.getItem("Username");
        var UserId = localStorage.getItem("UserId");
        $scope.rooms = data;
        $scope.allRooms = data;


        $scope.avaiableRooms = _.filter($scope.allRooms, function (item) {
            return _.contains(item, UserId);
        });

        //$scope.totalRooms = _.where($scope.allRooms, { isAvaiable: true });
        $scope.totalRooms = _.without($scope.allRooms, $scope.avaiableRooms, false);
        //$scope.rooms = _.without(data, { PlayerWhite: username });
        //$scope.rooms = _.without($scope.rooms, _.findWhere($scope.rooms, { PlayerWhite: username }, false));
        //$rootScope.$emit('roomAll', $scope.allRooms);
        $scope.$apply(function () {
            // $scope.rooms = data;
        });
        $scope.roomsinfo = room;
    });


    /* *********Timer Countdown ********/
    var stoppedWhite, stoppedBlack;

    //timeout function
    //1000 milliseconds = 1 second
    //Every second counts
    //Cancels a task associated with the promise. As a result of this, the //promise will be resolved with a rejection.  

    $scope.countdownWhite = function () {
        stoppedWhite = $timeout(function () {
            //console.log($scope.whitecounter);
            if ($scope.whitecounter != 0) {
                $scope.whitecounter--;
                $scope.whitecounterMin = Math.trunc($scope.whitecounter / 60);
                $scope.whitecounterSec = $scope.whitecounter % 60;
                var d = _.findWhere($scope.allRooms, { roomId: $scope.UserIdNewParams });
                //d.whiteUserTime = $scope.whitecounter;
                //_.extend(_.findWhere($scope.allRooms, { roomName: $scope.RoomName }), d);
                $scope.countdownWhite();
            } else {
                $scope.userTimeOut = false;
                $timeout.cancel(stoppedWhite);
            }
        }, 1000);
    };


    $scope.countdownBlack = function () {
        stoppedBlack = $timeout(function () {
            // console.log($scope.blackcounter);
            if ($scope.blackcounter != 0) {
                $scope.blackcounter--;
                $scope.blackcounterMin = Math.trunc($scope.blackcounter / 60);
                $scope.blackcounterSec = $scope.blackcounter % 60;
                var d = _.findWhere($scope.allRooms, { roomId: $scope.UserIdNewParams });
                // d.blackUserTime = $scope.blackcounter;
                //_.extend(_.findWhere($scope.allRooms, { roomName: $scope.RoomName }), d);
                $scope.countdownBlack();
            } else {
                $scope.userTimeOut = false;
                $timeout.cancel(stoppedBlack);
            }
        }, 1000);
    };


    $scope.stop = function () {
        $timeout.cancel(stopped);

    }
    /* *********Timer End*******/


    function getChessTablePoint(setupData, action) {
        mainService.managePointTable("PointTableMethod", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.pointDetails = data.data.managePointTableMethodResult;
                      $scope.pointDetails = _.findWhere($scope.pointDetails, { IsDefault: true });
                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };

    /*   
    
Tosss
<button id="click" type="button" onclick="click()">CLICK ME</button>
<p>
    You got: <span id="result"></span>
</p>
document.getElementById('click').onclick = click;

var heads = 0;
var tails = 0;
function click() {  
    x = (Math.floor(Math.random() * 2) == 0);
    if(x){
    	flip("heads");
    }else{
        flip("tails");
    }
};
function flip(coin) {
    document.getElementById("result").innerHTML = coin;
};
function coinFlip() {
    return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
}



    */


}]);


chessApp.controller('LoginController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$rootScope', '$timeout', 'DataService', '$state', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $rootScope, $timeout, DataService, $state, userPersistenceService) {
    $scope.init = function () {
        $scope.player = {};
        $scope.loginData = {};
        var socket = "";
        // $rootScope.$emit('connectivity');


    };
    //$rootScope.$on('socketData', function (data) {
    //    $rootScope.socket = data.currentScope.socket;
    //});
    // $scope.$emit('reloadConnection');
    function getChessTableSetupData(setupData, action) {
        mainService.setupChessTable("tableSetup", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      var tempsetting = _.findWhere(data.data.manageChessSetupDetailsResult, { IsDefault: true });
                      userPersistenceService.saveuserSetupSettings(tempsetting);
                      localStorage.setItem("tableSetupSettings", JSON.stringify(tempsetting));
                  }
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };

    $scope.login = function (playerdata) {
        $scope.param = playerdata;
        $timeout(function () {
            mainService.LoginAuthenticatePlayer("Login", $scope.param, 12)
                .then(function (data) {
                    //alert(data);
                    if (data.data != null) {
                        if (angular.isUndefined($rootScope.socket))
                            $scope.$emit('connectivity');
                        $scope.loginData = data.data.LoginAuthenticateResult;
                        if ($scope.loginData.length > 0) {
                            localStorage.removeItem("Username");
                            localStorage.setItem("Username", $scope.param.Username);
                            $rootScope.currentUser = localStorage.getItem("Username");
                            localStorage.removeItem("UserId");
                            var data = _.findWhere($scope.loginData, { Username: $scope.param.Username });
                            if (angular.isDefined(data))
                                localStorage.setItem("UserId", data.UserId);
                            var socketData = userPersistenceService.getUserSocketDataResponse();
                            notifierService.notifyMessage("success", "Login Successfully", $scope.param.Username + " account successfully Login !");
                            $state.go('ChessBoard');
                            $timeout(function () {
                                $scope.$emit('AllPlayers', $scope.loginData, $scope.param.Username);
                            }, 150);
                            if (angular.isDefined(socketData.SocketId)) {
                                var newData = { 'Username': $scope.param.Username, 'SocketId': localStorage.getItem("UserInfoSocketId"), 'UserId': localStorage.getItem("UserInfoId") };
                                $rootScope.socket.emit('onlineUser', newData);
                            }
                            var temp = {};
                            temp.UserId = data.UserId;
                            // getChessTableSetupData(temp,12);
                        }
                        else {
                            notifierService.notifyMessage("error", "Login Failed", $scope.param.Username + " Username or Password are Invalid !");
                        }
                    }
                    //you will get "data" as a response from service
                }, function (err) {
                    notifierService.notifyError();
                    console.log("some error occured." + err);
                });
        }, 150);

    };

    $scope.loginWithFB = function () {
        //var promiseGet = mainService.facebookService();
        //promiseGet.then(function (data) {
        //           $scope.last_name = data.last_name;
        //       }, function (err) {
        //           notifierService.notifyError();
        //           console.log("some error occured." + err);
        //       });

        //FB.login(function (response) {
        //    if (response.authResponse) {
        //        console.log('Welcome!  Fetching your information.... ');
        //        FB.api('/me',{
        //            fields:'email,name'
        //        },function (response) {
        //            console.log('Good to see you, ' + response.name + '.');
        //            console.log(response);
        //            var accessToken = FB.getAuthResponse();
        //            console.log(accessToken);
        //        });
        //    } else {
        //        console.log('User cancelled login or did not fully authorize.');
        //    }
        //}

        //   //, {
        ////    scope: 'publish_actions',
        ////    return_scopes: true
        ////}
        //);
        FB.getLoginStatus(function (response) {
            if (response.status == 'connected') {
                $scope.alreadyFacebookLogin = true;
                getCurrentUserInfo(response);
            } else {
                fbLoginApi();
            }
        });

        function getCurrentUserInfo() {
            FB.api('/me', {
                fields: 'email,name'
            }, function (userInfo) {
                if (DataService.isEmpty(userInfo.name) && DataService.isEmpty(userInfo)) {
                    fbLoginApi();
                }
                else {
                    if ($scope.alreadyFacebookLogin) {
                        notifierService.notifyMessage("note", "Facebook Login", "Facebook Already Login. !");
                    }
                    else {
                        if (DataService.isEmpty(userInfo.name) && DataService.isEmpty(userInfo)) {
                            notifierService.notifyMessage("success", "Facebook Login", "Facebook Login Successfully !");
                            console.log(userInfo.name + ': ' + userInfo.email);
                        }
                    }
                }
            });
        };
        function fbLoginApi() {
            FB.login(function (response) {
                if (response) {
                    $scope.alreadyFacebookLogin = false;
                    getCurrentUserInfo(response)
                } else {
                    notifierService.notifyMessage("error", "Facebook Login", "Authentication cancelled. !");
                    console.log('Auth cancelled.')
                }
            }
             //, {
             //    scope: 'email,name',
             //    return_scopes: true
             //}
             );
        };

    };



    $scope.WebSocketTest = function () {
        //if ("WebSocket" in $window) {

        //    alert("WebSocket is supported by your Browser!");

        //    // Let us open a web socket
        //    var ws = new WebSocket('ws://192.168.1.9:3000/');

        //    ws.onopen = function () {
        //        // Web Socket is connected, send data using send()
        //        ws.send("Message to send");
        //        alert("Message is sent...");
        //    };

        //    ws.onmessage = function (evt) {
        //        var received_msg = evt.data;
        //        alert("Message is received...");
        //    };

        //    ws.onclose = function () {
        //        // websocket is closed.
        //        alert("Connection is closed...");
        //    };
        //}

        //else {
        //    // The browser doesn't support WebSocket
        //    alert("WebSocket NOT supported by your Browser!");
        //}

        //var socket = new io.Socket('localhost', { port: 2858 });
        //socket.connect();

        //socket.on('connect', function () {
        //    console.log('Client has connected to the server !');
        //});

        //socket.on('message', function (data) {
        //    console.log('Received a message from the server !', data);
        //});

        //socket.on('disconnect', function () {
        //    console.log('The Client has disconnected !');
        //});

        //function sendMessageToServer(message) {
        //    socket.send(message);
        //};

    }



}]);

chessApp.controller('IndexController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$rootScope', '$timeout', 'DataService', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $rootScope, $timeout, DataService, userPersistenceService) {
    $scope.newPlayer = [];
    $scope.currentPlayer = {};

    $scope.join = function () {
        //socket.emit('add-player', $scope.currentPlayer);
    };

    /*socket.on('notification', function (data) {
        $scope.$apply(function () {
            $scope.newPlayer.push(data.player);
        });
    });*/
}]);

chessApp.controller('LobbyController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$rootScope', '$timeout', 'DataService', 'uuid', '$state', '$modal', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $rootScope, $timeout, DataService, uuid, $state, $modal, userPersistenceService) {


    $scope.init = function () {
        //$rootScope.$emit('connectivity');

        var u = localStorage.getItem("Username");
        if (!angular.isDefined(u) || u == null)
            $state.go('Login');


        $scope.newPlayer = [];
        $scope.onlinePlayerList = {};
        $scope.rooms = {};
        $scope.allRooms = {};
        $scope.roomName = "";
        $timeout(function () {
            $rootScope.socket.emit('getRooms');
        }, 150);
        $scope.tableSetupDetails = {};
        $scope.tableConfig = {};
        $scope.counter = 0;
        $rootScope.$emit('chessTableSetup');
    };

    $scope.createRoom = function () {
        var dt = localStorage.getItem("tableConfig");
        if (dt != "undefined") {
            var TableSetupData = JSON.parse(dt);
            var uniqueRoom = _.findWhere($scope.allRooms, { roomName: angular.lowercase($scope.roomName) });
            if (angular.isUndefined(uniqueRoom)) {

                var roomData = { roomName: angular.lowercase($scope.roomName), roomId: $scope.getRandomSpan(), PlayerWhite: angular.lowercase(localStorage.getItem("Username")), PlayerBlack: "", isAvaiable: true, UserIdWhite: localStorage.getItem("UserId"), UserIdBlack: "", FEN: "", GameStatus: "", whiteMoves: 0, blackMoves: 0, TotalTableTimeLimit: TableSetupData.TotalTimeLimit * 60, TotalTimePerMoveLimit: TableSetupData.TotalTimePerMoveLimit * 60 };
                roomData.tossCoin = coinFlip();
                $rootScope.socket.emit('create', roomData);
            } else {
                notifierService.notifyMessage("error", "Lobby Name Should be Unique: ", $scope.roomName + " it is already avaiable !");
            }
        } else {
            notifierService.notifyMessage("error", "Please Configure Table Setup: ", "Kindly add any one setup configration settings.!");
        }
    };

    function coinFlip() {
        return (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';
    };
    $scope.getRandomSpan = function () {
        //return uuid.new();
        return $rootScope.getRandomSpanUUID();
    }


    //$rootScope.$on('socketData', function (data) {
    //    $rootScope.socket = data.currentScope.socket;
    //});

    $rootScope.socket.on('updaterooms', function (data, room) {
        var username = localStorage.getItem("Username");
        $scope.rooms = data;
        $scope.allRooms = data;
        console.log(data);

        //$scope.rooms = _.without(data, { PlayerWhite: username });
        //$scope.rooms = _.without($scope.rooms, _.findWhere($scope.rooms, { PlayerWhite: username }, false));
        // $rootScope.$emit('roomAll', $scope.allRooms);
        $scope.$apply(function () {
            // $scope.rooms = data;
        });
        $scope.roomsinfo = room;
    });


    $scope.joinRoom = function (roomName) {
        var temp = _.findWhere($scope.rooms, { roomName: angular.lowercase(roomName.roomName) });
        // if (angular.isUndefined(temp)) {
        $rootScope.roomName = roomName.roomName;
        temp = roomName;
        if (temp.PlayerBlack == "") {
            if (temp.UserIdWhite != localStorage.getItem("UserId") && temp.UserIdBlack != localStorage.getItem("UserId")) {
                temp.PlayerBlack = angular.lowercase(localStorage.getItem("Username"));
                temp.isAvaiable = false;
                temp.UserIdBlack = localStorage.getItem("UserId");

                //angular.forEach($scope.allRooms, function (item) {
                //    if (angular.lowercase(item.roomName) == angular.lowercase(roomName.roomName)) {             
                //        item.PlayerBlack = localStorage.getItem("Username");
                //        item.isAvaiable = false;
                //        item.UserIdBlack = localStorage.getItem("UserId");
                //    }
                //});
                //roomName.PlayerBlack = localStorage.getItem("Username");
                $rootScope.socket.emit('joinRoom', roomName, $scope.allRooms);
            } else {
                $state.go('Game', { UserId: temp.roomId });
            }
        }
        else {
            if (temp.tournamentId != null) {
                // temp.UserIdBlack = localStorage.getItem("UserId");
                $rootScope.socket.emit('joinRoom', roomName, $scope.allRooms);
            } else {
                $state.go('Game', { UserId: temp.roomId });
            }
        }
        //} else {
        //     notifierService.notifyMessage("error", "You are Already Avaiable: ", roomName.roomName + " It is your created Lobby.!");

        //  }
    };


    $scope.sendEmail = function (room) {
        var data = $state;
        var d = window.location;
        var url = "http://" + $window.location.host + "/#/Game/" + room.roomId;
        console.log(url);
        //  Email.send("saif@dunitech.com", "saif.ansari2@gmail.com", "Test Link", url, "209.188.12.162", "saif", "saif!@123");
        //Email.send("saif@dunitech.com", "saif.ansari2@gmail.com", "Test Link", url, "webmail.dunitech.com", "saif", "saif!@123");
        // Email.send("support@btcglobal5.net", "saif.ansari2@gmail.com", "Test Link", url, "108.170.59.102", "support@btcglobal5.net", "global!@123");
        bootbox.prompt({
            title: "Please Enter Your Friend Email Id to Send Link to Play<br/>" + url,
            inputType: 'email',
            callback: function (result) {
                if (result != null) {
                    $scope.toEmailId = result;
                    var emailData = {
                        from: "support@btcglobal5.net",
                        to: $scope.toEmailId,
                        subject: "Test Link",
                        body: url

                    };
                    $rootScope.socket.emit('sendEmail', emailData);
                }
            }
        });





    };

    // Email.send("from@you.com","to@them.com","This is a subject","this is the body","smtp.yourisp.com","username","password");
    //Email.send("from@you.com",        "to@them.com",        "This is a subject",        "this is the body",        {token: "63cb3a19-2684-44fa-b76f-debf422d8b00"});



    $rootScope.socket.on('joinCount', function (data) {
        var value = data;
        if (angular.lowercase(value.PlayerWhite) == angular.lowercase(localStorage.getItem("Username"))) {
            $state.go('Game', { UserId: value.roomId });
            $timeout(function () {
                $rootScope.$emit('roomDataEvent', value);
            }, 250);
        } else if (angular.lowercase(value.PlayerBlack) == angular.lowercase(localStorage.getItem("Username"))) {
            $state.go('Game', { UserId: value.roomId });
            $timeout(function () {
                $rootScope.$emit('roomDataEvent', value);
            }, 250);
        }


    });







}]);

chessApp.controller('SetupTableController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$rootScope', '$timeout', 'DataService', 'uuid', '$state', 'ngTableParams', '$modal', '$log', '$stateParams', '$filter', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $rootScope, $timeout, DataService, uuid, $state, ngTableParams, $modal, $log, $stateParams, $filter) {

    $scope.init = function () {
        $scope.table = {};
        $scope.tableDetails = {};
        $scope.UserDetails = {};
        $scope.UserDetails.UserId = localStorage.getItem("UserId");
        $scope.table.UserId = $scope.UserDetails.UserId;
        getChessTableSetupData($scope.UserDetails, 12);
        $scope.isEdit = false;

        $scope.winningType = [];
        $scope.winningType.push("Point Based");
        $scope.winningType.push("Time Based");

    };
    $scope.doSearch = function () {

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: $scope.tableDetails.length, // length of data
            getData: function ($defer, params) {
                if (params.settings().$scope == null) {
                    params.settings().$scope = $scope;
                }
                data = $scope.tableDetails;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));



            }
        });

        $scope.tableParams.reload();

    }

    function getChessTableSetupData(setupData, action) {

        mainService.setupChessTable("tableSetup", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.tableParams = {};
                      $scope.tableDetails = data.data.manageChessSetupDetailsResult;
                      angular.forEach($scope.tableDetails, function (item) {
                          if (item.UserId == $scope.UserDetails.UserId) {
                              item.Username = localStorage.getItem("Username");
                          }
                      });
                      // notifierService.notifyRegister(" ", $scope.param.Username + " account successfully registered !");
                      //$scope.player = {};
                      //alert('Updated');

                      //$scope.chessTableSetupDetails = new ngTableParams({
                      //    page: 1,
                      //    count: 10,
                      //    filter: {
                      //    },
                      //    sorting: {
                      //        name: 'asc' // initial filter
                      //    }
                      //}, { dataset: $scope.tableDetails });
                      //$scope.tableParams.reload();

                      $scope.doSearch();
                      //$scope.params.settings().$scope = $scope;



                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };

    $scope.open = function () {
        $scope.table = {};
        $scope.table.UserId = localStorage.getItem("UserId");
        $scope.table.IsDefault = false;
        modelPop();
    };


    function modelPop() {
        $modal.open({
            templateUrl: 'folder/Templates/Admin/addSetupModel.html',
            controller: 'modalController',
            scope: $scope
        })
  .result.then(function () {
      $scope.doSearch();

  }, function () {
      // alert('canceled');
  });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.saveSetup = function (table, type) {
        //alert(table.IsDefault);
        if (type == 1)
            getChessTableSetupData(table, 11);
        else if (type = 2)
            getChessTableSetupData(table, 15);
        $scope.table.TotalTimeLimit = '';
        $scope.table.TotalTimePerMoveLimit = '';
        $scope.table.IsDefault = false;
        $scope.isEdit = false;
    };

    $scope.editsetup = function (data) {
        $scope.isEdit = true;
        $scope.table = data;
        modelPop();
    };
    $scope.deletesetup = function (data) {
        var temp = {};
        temp.Id = data.Id;
        temp.UserId = data.UserId;
        getChessTableSetupData(temp, 13);
    };






}]);

chessApp.controller('AdminLoginController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$rootScope', '$timeout', 'DataService', '$state', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $rootScope, $timeout, DataService, $state, userPersistenceService) {
    $scope.init = function () {
        $scope.admindata = {};
        $scope.loginData = {};
        var socket = "";


    };

    $scope.login = function (admindata) {
        $scope.param = admindata;
        $timeout(function () {
            mainService.adminLogin("AdminLogin", $scope.param, 11)
                .then(function (data) {
                    //alert(data);
                    if (data.data != null) {
                        $scope.loginData = data.data.adminLoginAuthenticateResult;
                        if ($scope.loginData.length > 0) {
                            localStorage.removeItem("Username");
                            localStorage.setItem("Username", $scope.param.Username);
                            localStorage.removeItem("UserId");
                            localStorage.setItem("UserId", $scope.loginData[0].Id);
                            $rootScope.currentUser = localStorage.getItem("Username");
                            notifierService.notifyMessage("success", "Login Successfully", $scope.param.Username + " account successfully Login !");
                            $state.go('admindashboard');
                        }
                        else {
                            notifierService.notifyMessage("error", "Login Failed", $scope.param.Username + " Username or Password are Invalid !");
                        }
                    }
                    //you will get "data" as a response from service
                }, function (err) {
                    notifierService.notifyError();
                    console.log("some error occured." + err);
                });
        }, 150);

    };





}]);


chessApp.controller('ChessPointTableController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$rootScope', '$timeout', 'DataService', 'uuid', '$state', 'ngTableParams', '$modal', '$log', '$stateParams', '$filter', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $rootScope, $timeout, DataService, uuid, $state, ngTableParams, $modal, $log, $stateParams, $filter, userPersistenceService) {

    $scope.init = function () {
        $scope.pointtable = {};
        $scope.pointDetails = {};
        $scope.UserDetails = {};
        $scope.UserDetails.UserId = localStorage.getItem("UserId");
        $scope.pointtable.UserId = $scope.UserDetails.UserId;
        getChessTablePoint($scope.UserDetails, 12);
        $scope.isEdit = false;


    };
    $scope.doSearch = function () {
        $scope.tableParams = [];
        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: $scope.pointDetails.length, // length of data
            getData: function ($defer, params) {
                if (params.settings().$scope == null) {
                    params.settings().$scope = $scope;
                }
                data = $scope.pointDetails;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));



            }
        });

    }

    function getChessTablePoint(setupData, action) {
        mainService.managePointTable("PointTableMethod", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.pointDetails = data.data.managePointTableMethodResult;
                      $scope.doSearch();
                      $scope.tableParams.reload();
                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };



    $scope.checkItem = "";

    $scope.loadEditForm = function () {
        $scope.checkItem = "yes";
        $scope.pointtable = {};
        modelPop();
    };


    function modelPop() {
        $modal.open({
            templateUrl: 'folder/Templates/Admin/addChessPointModel.html',
            controller: 'modalController',
            scope: $scope
        })
  .result.then(function () {
      $scope.doSearch();

  }, function () {
      // alert('canceled');
  });
    };




    $scope.saveSetup = function (pointtable, type) {
        //alert(table.IsDefault);  
        pointtable.UserId = $scope.UserDetails.UserId;
        if (type == 1)
            getChessTablePoint(pointtable, 11);
        else if (type = 2)
            getChessTablePoint(pointtable, 15);
        $scope.isEdit = false;
    };

    $scope.editsetup = function (data) {
        $scope.isEdit = true;

        $scope.pointtable = data;
        modelPop();
    };
    $scope.deletesetup = function (data) {
        if (confirm("Are you sure to Delete this Record.?")) {
            var temp = {};
            temp.Id = data.Id;
            temp.UserId = data.UserId;
            getChessTablePoint(temp, 13);
        }
    };

}]);


chessApp.controller('TournamentSetupController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$rootScope', '$timeout', 'DataService', 'uuid', '$state', 'ngTableParams', '$modal', '$log', '$stateParams', '$filter', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $rootScope, $timeout, DataService, uuid, $state, ngTableParams, $modal, $log, $stateParams, $filter, userPersistenceService) {

    $scope.init = function () {
        $scope.tournamentData = {};
        $scope.tournamentDetails = {};
        $scope.UserDetails = {};
        $scope.UserDetails.UserId = localStorage.getItem("UserId");
        $scope.tournamentData.UserId = parseInt($scope.UserDetails.UserId);
        getTournamentDetails($scope.UserDetails, 15);
        $scope.isEdit = false;

        $scope.winningType = [];
        $scope.winningType.push("Point Based");
        $scope.winningType.push("Time Based");


        $scope.tournamentData.T_StartTime = new Date();
        $scope.tournamentData.T_EndTime = new Date();

        $scope.showMeridian = true;
        $scope.isWinner = false;
    };
    $scope.doSearch = function () {
        $scope.tableParams = [];
        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: $scope.tournamentDetails.length, // length of data
            getData: function ($defer, params) {
                if (params.settings().$scope == null) {
                    params.settings().$scope = $scope;
                }
                data = $scope.tournamentDetails;
                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));





            }

        });
        $scope.tableParams.reload();


    }

    function getTournamentDetails(setupData, action) {
        mainService.manageTournamentTable("tournamentTableMethod", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.tournamentDetails = {};
                      $scope.tournamentDetails = data.data.manageTournamentTableMethodResult;
                      $scope.doSearch();
                      angular.forEach($scope.tournamentDetails, function (t) {
                          t.T_StartDate = $rootScope.ToWcfDate(t.T_StartDate);
                          t.T_EndDate = $rootScope.ToWcfDate(t.T_EndDate);
                      });
                     
                      notifierService.notifyMessage("success", "Record Saved !", "Tournament Saved. !");

                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };



    $scope.checkItem = "";

    $scope.loadEditForm = function () {
        $scope.checkItem = "yes";
        $scope.tournamentData = {};
        //$scope.tournamentData.T_EndDate =new Date();
        //$scope.tournamentData.T_StartDate =new Date();

        var tId = 0;
        if (angular.isDefined($scope.tournamentDetails)) {
            if ($scope.tournamentDetails.length == 0)
                tId = 1;
            else
                tId = parseInt($scope.tournamentDetails[$scope.tournamentDetails.length - 1].TournamentId) + 1;
            $scope.tournamentData.TournamentId = tId;
            modelPop();
        }
    };


    function modelPop() {
        $modal.open({
            templateUrl: 'folder/Templates/Admin/addTournamentSetupModel.html',
            controller: 'modalController',
            scope: $scope
        })
  .result.then(function () {
      $scope.doSearch();

  }, function () {
      // alert('canceled');
  });
    };




    $scope.saveTournament = function (tournament, type) {
        //alert(table.IsDefault);  
        // tournament.UserId = $scope.UserDetails.UserId;

        if (parseInt(tournament.NoOfPlayers) % 4 == 0) {

            tournament.T_Winner = "";
            tournament.T_Status = "";
            tournament.T_StartDate = $rootScope.ToJsonDate(tournament.T_StartDate);
            tournament.T_EndDate = $rootScope.ToJsonDate(tournament.T_EndDate);
            tournament.T_StartTime = $rootScope.ToJsonDate(tournament.T_StartTime);
            tournament.T_EndTime = $rootScope.ToJsonDate(tournament.T_EndTime);
            if (type == 1) {
                tournament.Id = 0;
                //tournament.T_StartDate = moment(tournament.T_StartDate).format("DD/MM/YYYY");
                //tournament.T_EndDate = new Date(tournament.T_EndDate);
                getTournamentDetails(tournament, 11);
            }
            else if (type = 2) {
                getTournamentDetails(tournament, 12);

            }
            $scope.isEdit = false;
        } else {
            notifierService.notifyMessage("warning", "No of Players", "No Of Players Should be Multiple of 4");
        }
    };

    $scope.editTournament = function (data) {
        $scope.isEdit = true;
         //data.T_StartDate = $rootScope.ToWcfDate(data.T_StartDate);
        // data.T_EndDate = $rootScope.ToWcfDate(data.T_EndDate);

        data.T_StartTime = $rootScope.ToWcfDate(data.T_StartTime);
        data.T_EndTime = $rootScope.ToWcfDate(data.T_EndTime);
        $scope.tournamentData = data;
        modelPop();
    };
    $scope.deleteTournament = function (data) {
        if (confirm("Are you sure to Delete this Record.?")) {
            var temp = {};
            temp.Id = data.Id;
            temp.UserId = data.UserId;
            getTournamentDetails(temp, 13);
        }
    };

    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function () {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function () {
        $scope.popup2.opened = true;
    };

    $scope.setDate = function (year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
        opened: false
    };

    $scope.popup2 = {
        opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [
      {
          date: tomorrow,
          status: 'full'
      },
      {
          date: afterTomorrow,
          status: 'partially'
      }
    ];

    function getDayClass(data) {
        var date = data.date,
          mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    }

}]);


chessApp.controller('allTournamentController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$rootScope', '$timeout', 'DataService', 'uuid', '$state', 'ngTableParams', '$modal', '$log', '$stateParams', '$filter', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $rootScope, $timeout, DataService, uuid, $state, ngTableParams, $modal, $log, $stateParams, $filter, userPersistenceService) {
    $scope.init = function () {

        $scope.tournament = {};
        $scope.tournamentDetails = {};
        $scope.UserDetails = {};
        // $scope.UserDetails.UserId = localStorage.getItem("Id");
        $scope.UserDetails.Id = parseInt(localStorage.getItem("UserId"));
        // $scope.tournamentData.UserId = $scope.UserDetails.UserId;
        getTournamentTable($scope.UserDetails, 15);
        var temp = {};
        temp.P_UserId = localStorage.getItem("UserId");
        $timeout(function () {
            getTournamentDetails(temp, 12);
        }, 250);

        $scope.isEdit = false;

        $scope.allTournamentPlayers = {};
        $scope.playerList = {};
        getplayers();
        $scope.matchesView = false;
        $scope.tournamentRound = [];

        $scope.UserIdColor = undefined;
        $scope.OpponentIdColor = undefined;
        $scope.linkUserId = "";
        $scope.linkOpponentId = "";
        // $scope.names = ["john", "bill", "charlie", "robert", "alban", "oscar", "marie", "celine", "brad", "drew", "rebecca", "michel", "francis", "jean", "paul", "pierre", "nicolas", "alfred", "gerard", "louis", "albert", "edouard", "benoit", "guillaume", "nicolas", "joseph"];
        $scope.names = [];
        $scope.isFirstRound = false;
    
        $scope.tournamentWinnerName = null;


    };

    function onLoad() {
        $(window).on("load", function () {
            $(".tournament_block55").mCustomScrollbar({
                setHeight: 450,
                theme: "minimal-dark"
            });
        });
    };
    function getTournamentTable(setupData, action) {
        mainService.manageTournamentTable("tournamentTableMethod", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.tournament = {};
                      var t = {};
                      t.isAlreadyJoin = false;
                      $scope.tournament = data.data.manageTournamentTableMethodResult;
                      $scope.tournament = $scope.tournament.map(function (obj) {
                          return angular.extend(obj, t);
                      });



                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };
    function getTournamentDetails(setupData, action) {
        mainService.manageTournamentDetails("tournamentDetailsMethod", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.tournamentDetails = {};
                      $scope.tournamentDetails = data.data.manageTournamentDetailsMethodResult;
                      var userId = localStorage.getItem("UserId");
                      $scope.allMyTournament = {};
                      $scope.allMyTournament = _.where(data.data.manageTournamentDetailsMethodResult, { P_UserId: parseInt(userId) });
                      $scope.allMyTournamentList = [];
             
                      $timeout(function () {
                          angular.forEach($scope.tournament, function (item) {
                              var data = _.findWhere($scope.tournamentDetails, { T_Id: item.TournamentId, P_UserId: parseInt(userId) });
                              var joinPlayers = _.where($scope.tournamentDetails, { T_Id: item.TournamentId });
                              if (joinPlayers != null && joinPlayers.length > 0)
                                  item.noOfAvaiablePlayers = joinPlayers.length;
                              else
                                  item.noOfAvaiablePlayers = 0;
                              if (data != null) {
                                  item.isAlreadyJoin = true;
                              }

                          

                          });
                          angular.forEach($scope.allMyTournament, function (t) {
                              var tour = _.findWhere($scope.tournament, { TournamentId: t.T_Id });
                              $scope.allMyTournamentList.push(tour);
                          });
                      }, 150);



                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };

    $scope.joinTournament = function (tour) {
        if (angular.isDefined(tour.TournamentId)) {
            alert(tour.TournamentName);
            var temp = {};
            temp.T_Id = tour.TournamentId;
            var userId = localStorage.getItem("UserId");
            temp.P_UserId = userId;
            getTournamentDetails(temp, 11);
        }
    };

    function saveRoundScoreDetails(setupData, action) {
        mainService.manageRoundDetailsTable("tournamentRoundDetails", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.tournamentRoundDetails = {};
                      $scope.tournamentRoundDetails = data.data.manageTournamentRoundScoreDetailsMethodResult;



                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };

    $scope.viewAllPlayers = function (tour) {
        $scope.isWinner = true;
        $scope.names = [];
        $scope.TournamentName = tour.TournamentName;
        //getTournamentTable($scope.UserDetails, 15);
        userPersistenceService.setCookieData("tournamentId", tour.TournamentId);





        $scope.allTournamentPlayers = _.where($scope.tournamentDetails, { T_Id: tour.TournamentId });
        //angular.forEach($scope.allTournamentPlayers, function (item) {
        //       var data = _.findWhere($scope.playerList, { Id: parseInt(item.P_UserId)});

        //  });


        $scope.teams = [];
        $scope.teams1 = [];
        var t = [];
        var j = 0;
        var temp = "";
        angular.forEach($scope.allTournamentPlayers, function (i) {
            //  t= t+i.Username + ",";
            j++;
            t.push(i.Username);
            $scope.teams.push(i.Username);
            if (j % 2 == 0) {

                $scope.teams1.push($scope.teams);
                t = [];
            }
            temp = temp + i.Username + ",";

        });



        //$scope.names = temp;



        var roundData = [];
        angular.forEach($scope.allTournamentPlayers, function (d) {

            for (i = 0; i < 2; i++) {
                var temp = {};
                temp.T_Id = d.T_Id;
                temp.P_UserId = d.P_UserId;
                temp.T_Round = 1;
                temp.NoOfMatches = 2;
                roundData.push(temp);

            }

        }


            );

        $timeout(function () {

            // saveRoundScoreDetails(roundData, 11);
        }, 100);


        //$scope.teams.push("XYZ");
        //$scope.teams.push("ABC");
        //$scope.teams.push("XYZ1");
        //$scope.teams.push("ABC2");
        //temp = temp.slice(0, temp.lastIndexOf(","));

        // $("#singleElimination .demo").bracket({ init: singleElimination });


        if ($scope.teams != null)

            // var teams = [$scope.teams[0], $scope.teams[1], $scope.teams[2], $scope.teams[3], $scope.teams[4], $scope.teams[5], $scope.teams[6], $scope.teams[7]]
            var teams = [];
        angular.forEach($scope.teams, function (item) {
            teams.push(item);
            //$scope.names.push(item);
        });

        var seeds = [5, 15, 4, 6]

        $scope.matchups = []
        $scope.seedMatchups = []
        $scope.results = []
        $scope.resultCounter = 0;
        //iterate through the list of teams, and pair them off into matchups 2 at a time
        for (var n = 0; n < teams.length; n += 2) {
            $scope.newMatchup = [teams[n], teams[n + 1]]
            $scope.seedMatchupTemp = [seeds[n], seeds[n + 1]];
            $scope.seedMatchup = [seeds[n], seeds[n + 1]]

            console.log('creating matchup ' + $scope.newMatchup)
            console.log('creating Seed ' + $scope.seedMatchup)
            //take our new matchup and add it to our list of matchups
            $scope.matchups.push($scope.newMatchup);
            $scope.seedMatchups.push($scope.seedMatchup);
        }
        //using these matchups, create a tournament object. It has no results yet.
        $scope.tournamentDiagramData = { teams: $scope.matchups, results: $scope.results }

        angular.forEach($scope.tournamentDiagramData.teams, function (item) {
            //$scope.playTournamentClick(item);
        });
        localStorage.setItem("tournament", JSON.stringify($scope.tournamentDiagramData));
        console.log($scope.tournamentDiagramData)
        refreshBracket();


        $scope.tournamentMatches = JSON.parse(localStorage.getItem("tournament"));



        saveLinkInvitaionDetails({ T_Id: parseInt(tour.TournamentId) }, 16);     
        
        $rootScope.safeApply($scope);
        //$scope.safeApply($scope);
    };

    function refreshBracket() {
        //var $bracket = $('#bracket');
        //$bracket.empty()
        //$bracket.bracket({
        //    skipConsolationRound: true,
        //    init: $scope.tournamentDiagramData
        //})
    }
    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    function simulateRound() {
        console.log('Running round simulation')
        $scope.roundResults = { scores: [], nextSeeds: [] };
        $timeout(function () {
            //iterate through each matchup
            for (var x = 0; x < $scope.seedMatchups.length; x++) {
                //get the seeds
                //get the probability for those seeds

                var highSeed = Math.max($scope.seedMatchups[x][0], $scope.seedMatchups[x][1])
                var lowSeed = Math.min($scope.seedMatchups[x][0], $scope.seedMatchups[x][1])
                // var tmp = lowSeed + "-" + highSeed;
                //   var upsetPercentage = $('#' + tmp).val();
                // console.log('High seed ' + highSeed + ' vs low seed ' + lowSeed + ' with upset % ' + upsetPercentage);

                $scope.matchupResult = [highSeed, lowSeed];
                $scope.roundResults.scores.push([$scope.seedMatchups[x][0], $scope.seedMatchups[x][1]]);
                $scope.roundResults.nextSeeds.push(highSeed)


                //calculate who won
                //push results
                //push matchup and seeds
                //$scope.matchupResult = [1, 1]
                ////Handle mirror matchups
                //if (highSeed == lowSeed) {
                //    console.log('Mirror matchup!')
                //    if (Math.random() > .5) {
                //        $scope.roundResults.scores.push([1, 2])
                //    } else {
                //        
                //    }
                //    $scope.roundResults.nextSeeds.push(highSeed)
                //} else if (Math.random() > upsetPercentage) {
                //    $scope.matchupResult[$scope.seedMatchups[x].indexOf(highSeed)] = 2
                //    //console.log(matchupResult)
                //    $scope.roundResults.scores.push($scope.matchupResult)
                //    $scope.roundResults.nextSeeds.push(highSeed)

                //} else {
                //    $scope.matchupResult[$scope.seedMatchups[x].indexOf(lowSeed)] = 2
                //    //console.log(matchupResult)
                //    $scope.roundResults.scores.push($scope.matchupResult)
                //    $scope.roundResults.nextSeeds.push(lowSeed)
                //}

            }
            //set up next seedMatchups
            $scope.seedMatchups = []
            for (var x = 0; x < $scope.roundResults.nextSeeds.length; x += 2) {
                $scope.seedMatchups.push([$scope.roundResults.nextSeeds[x], $scope.roundResults.nextSeeds[x + 1]])
            }
            //update results and bracket
            console.log($scope.roundResults)
            $scope.results.push($scope.roundResults.scores)
            $scope.tournamentDiagramData.results = $scope.results;
            localStorage.removeItem("tournament");
            localStorage.setItem("tournament", JSON.stringify($scope.tournamentDiagramData));
        }, 300);
        $scope.$apply();
    }

    function resetBracket() {
        //reset tourney
        console.log('Resetting bracket');
        matchups = []
        seedMatchups = []
        results = []
        for (var n = 0; n < teams.length; n += 2) {
            var newMatchup = [teams[n], teams[n + 1]]
            var seedMatchup = [seeds[n], seeds[n + 1]]
            console.log('creating matchup ' + newMatchup)
            matchups.push(newMatchup);
            seedMatchups.push(seedMatchup);
        }
        tournament = { teams: matchups, results: [] }
        refreshBracket()
    }

    $('#simulateRound').click(function () {
        simulateRound()
        $timeout(function () {
            refreshBracket();
        }, 400);
    });
    $('#simulateTournament').click(function () {
        resetBracket();
        for (var x = 0; x < 6; x++) {
            simulateRound();
        }
        refreshBracket();
    })
    $('#resetBracket').click(function () { resetBracket() })


    //var singleElimination = {
    //    "teams": [              // Matchups
    //      ["Team 1", "Team 2"], // First match
    //      ["Team 3", "Team 4"]  // Second match
    //    ],
    //    "results": [            // List of brackets (single elimination, so only one bracket)
    //      [                     // List of rounds in bracket
    //        [                   // First round in this bracket
    //          [1, 2],           // Team 1 vs Team 2
    //          [3, 4]            // Team 3 vs Team 4
    //        ],
    //        [                   // Second (final) round in single elimination bracket
    //          [5, 6],           // Match for first place
    //          [7, 8]            // Match for 3rd place
    //        ]
    //      ]
    //    ]
    //}

    // $(function () { $('div#singleElimination .demo').bracket({ init: singleElimination }) })


    function saveRoundScoreDetails(setupData, action) {
        mainService.manageRoundDetailsTable("tournamentRoundDetails", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.tournamentRoundDetails = {};
                      $scope.tournamentRoundDetails = data.data.manageTournamentRoundScoreDetailsMethodResult;
                      if ($scope.tournamentRoundDetails.length > 0) {
                          $timeout(function () {
                              $scope.tempPlayers = _.where($scope.tournamentRoundDetails, { P_UserId: parseInt(localStorage.getItem("UserId")) });

                              $scope.matchesSets = [];

                              angular.forEach($scope.tournamentMatches.teams, function (t) {
                                  angular.forEach($scope.tempPlayers, function (d) {
                                      if (d.Username == t[0] || d.Username == t[1])
                                          $scope.matchesSets.push(t);
                                  });

                              });
                          }, 150);


                      }
                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };


    function getplayers() {
        var promiseGet = mainService.GetDataPlayers("GetPlayers");
        promiseGet.then(function (pl) {
            $scope.playerList = pl.data.ManagePlayerResult;
        },
              function (errorPl) {
                  notifierService.notifyError();
                  $log.error('Some Error in Getting Records.', errorPl);
              });
    };

    $scope.playTournamentClick = function (match) {
        //alert(match);
        var useridWhite = _.findWhere($scope.playerList, { Username: match[0] }).Id;
        var useridBlack = _.findWhere($scope.playerList, { Username: match[1] }).Id;

        // var d = match.split(',');
        var uudi = $rootScope.getRandomSpanUUID();

        if (match != null) {
            var dt = localStorage.getItem("tableConfig");
            if (dt != "undefined") {
                var TableSetupData = JSON.parse(dt);
                var tournamentData = {
                    roomName: uudi,
                    roomId: uudi,
                    tournamentId: userPersistenceService.getCookieData("tournamentId"),
                    PlayerWhite: match[0],
                    PlayerBlack: match[1],
                    isAvaiable: false,
                    UserIdWhite: useridWhite,
                    UserIdBlack: useridBlack,
                    FEN: "",
                    GameStatus: "",
                    whiteMoves: 0,
                    blackMoves: 0,
                    roundNo: 1,
                    TotalTableTimeLimit: TableSetupData.TotalTimeLimit * 60,
                    TotalTimePerMoveLimit: TableSetupData.TotalTimePerMoveLimit * 60
                };
                $rootScope.socket.emit('create', tournamentData);
            } else {
                notifierService.notifyMessage("error", "Please Configure Table Setup: ", "Kindly add any one setup configration settings.!");
            }
        }
    };

    $scope.joinTournamentStart = function (data) {

        $timeout(function () {
            if (angular.isDefined($scope.tournamentRoundDetails)) {
                var temp = {};
                temp.matches = [];
                temp.T_Id = userPersistenceService.getCookieData("tournamentId");
                temp.PlayerWhite = data[0];
                temp.PlayerBlack = data[1];
                temp.UserIdWhite = _.findWhere($scope.playerList, { Username: temp.PlayerWhite }).Id;
                temp.UserIdBlack = _.findWhere($scope.playerList, { Username: temp.PlayerBlack }).Id;

                $scope.userMatchWhite = _.where($scope.tournamentRoundDetails, { P_UserId: temp.UserIdWhite, T_Id: temp.T_Id });
                $scope.userMatchBlack = _.where($scope.tournamentRoundDetails, { P_UserId: temp.UserIdBlack, T_Id: temp.T_Id });
                temp.matches.push(_.findWhere($scope.userMatchWhite, { NoOfMatches: 1 }));
                temp.matches.push(_.findWhere($scope.userMatchBlack, { NoOfMatches: 1 }));
                temp.roomId = $rootScope.getRandomSpanUUID();
                temp.roomName = temp.roomId;
                temp.whiteUserTime = 0;
                temp.blackUserTime = 0;
                temp.moveHistory = [];
                temp.totalWitePlayerPoints = 0;
                temp.totalBlackPlayerPoints = 0;
                temp.whiteMoves = 0;
                temp.blackMoves = 0;
                $rootScope.socket.emit('joinRoom', temp);

            }
        }, 150);


    };


    $rootScope.socket.on('joinCount', function (data) {
        var value = data.matches[0];
        var value1 = data.matches[1];
        //var value = data.PlayerWhite;
        //var value1 = data.PlayerBlack;
        if (angular.lowercase(value.Username) == angular.lowercase(localStorage.getItem("Username"))) {
            $state.go('TournamentMatch', { UserId: data.roomId });
            $timeout(function () {
                $rootScope.$emit('roomDataEvent', data);
            }, 250);
        } else if (angular.lowercase(value1.Username) == angular.lowercase(localStorage.getItem("Username"))) {
            $state.go('TournamentMatch', { UserId: data.roomId });
            $timeout(function () {
                $rootScope.$emit('roomDataEvent', data);
            }, 250);
        }

        localStorage.setItem("matches", JSON.stringify(data));
    });

    $scope.viewMatchesRounds = function (m) {
        var temp = {};
        temp.T_Id = m.TournamentId;
        userPersistenceService.setCookieData("tournamentId", temp.T_Id);
        $scope.TournamentName = m.TournamentName;

        var r = m.NoOfPlayers;
        var rounds = 0;
        do {
            r = r / 2;
            rounds += 1;       
        } while (r > 1);
        $scope.totalRounds = rounds;
        // saveRoundScoreDetails([temp], 15);  
        $scope.currentUser = localStorage.getItem("Username");
        temp.Username = localStorage.getItem("Username");
        temp.OpponentUsername = localStorage.getItem("Username");     
        updateFENDetailsGame(temp, 15);
        $timeout(function () {
            saveLinkInvitaionDetails(temp, 17);
        }, 150);


    };

    $scope.sendInvitaion = function (username, color, oppo, oppocolor, round) {
        if (username != oppo && angular.isDefined(username) && angular.isDefined(oppo) && oppo != "" && username != "") {
            $scope.names.splice($scope.names.indexOf(username), 1);
            $scope.names.splice($scope.names.indexOf(oppo), 1);
            localStorage.setItem("names", JSON.stringify($scope.names));
            var uudi = $rootScope.getRandomSpanUUID();
            var temp = {};
            temp.Username = username;
            temp.OpponentUsername = oppo;
            temp.UserIdColor = (color) ? "W" : "B";
            temp.OpponentIdColor = (oppocolor) ? "W" : "B";
            temp.T_Id = parseInt(userPersistenceService.getCookieData("tournamentId"));
            temp.RoundNo = round;
            temp.LinkInvitationDate = $rootScope.ToJsonDate(new Date());
            temp.GameStatus = "Start";
            temp.LinkStatus = 1;
            temp.ULink = '/TournamentMatch/' + uudi + "/" + round + "/" + temp.T_Id + "/" + temp.UserIdColor;
            temp.TableId = uudi;
            temp.OLink = '/TournamentMatch/' + uudi + "/" + round + "/" + temp.T_Id + "/" + temp.OpponentIdColor;
            $timeout(function () {
                saveLinkInvitaionDetails(temp, 11);
            }, 150);
            // Email.send("from@you.com","to@them.com","This is a subject","this is the body","smtp.yourisp.com","username","password");
            //Email.send("from@you.com",        "to@them.com",        "This is a subject",        "this is the body",        {token: "63cb3a19-2684-44fa-b76f-debf422d8b00"});
        } else {
            notifierService.notifyMessage("error", "Same Player !", "Both Player Should be different.!");
        }
          $rootScope.safeApply($scope);

    };


    function saveLinkInvitaionDetails(setupData, action) {
        var tourId = parseInt(userPersistenceService.getCookieData("tournamentId"));
        var tourId1 = userPersistenceService.getCookieData("tournamentId");
        $scope.tournamentRound = 1;
        mainService.sendLinkInfo("sendLinkDetails", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.linkDetails = {};
                      $scope.linkDetails = _.where(data.data.sendLinkDetailsResult, { T_Id: tourId });
                      $scope.isWinner = false;
                      //localStorage.setItem("LinkDetails",JSON.stringify($scope.linkDetails[0]));
                      if (action == 16) {
                          if ($scope.linkDetails.length == 0) {
                              $scope.names = [];
                            
                              $scope.isFirstRound = true;
                              if ($scope.names.length != $scope.teams.length) {
                                  angular.forEach($scope.teams, function (item) {
                                      $scope.names.push(item);
                                  });
                              }
                            
                          } else {
                              if (action == 16) {
                                  var noofmatches = _.findWhere($scope.tournament, { TournamentId: tourId1 }).NoOfPlayers;
                                  var totalAvaiablePlayers = _.where($scope.tournamentDetails, { T_Id: tourId1 }).length;
                                  var r = noofmatches;
                                  $scope.noOfRoundTemp = 0;
                                  do {
                                      r = r / 2;
                                      $scope.noOfRoundTemp += 1;
                                      var roundLink = _.where($scope.linkDetails, { RoundNo: $scope.noOfRoundTemp });
                                      if (roundLink.length == r) {
                                          $scope.tournamentRound = $scope.noOfRoundTemp;                              
                                      } else {                                          
                                          break;
                                      }

                                  } while (r > 1);

                                  // if (noofmatches / 2 == $scope.linkDetails.length) {
                                  var d = {};
                                  d.T_Id = tourId;
                                  d.roundNo = $scope.tournamentRound;
                                  updateFENDetailsGame(d, 15);

                                  var maxRound = _.findWhere($scope.linkDetails, { RoundNo: $scope.noOfRoundTemp });
                                  if (angular.isDefined(maxRound) && maxRound.RoundNo == $scope.noOfRoundTemp && $scope.linkDetails.length == noofmatches-1)
                                      $scope.isWinner = true;
                                  else
                                      $scope.tournamentRound = $scope.noOfRoundTemp;
                                      $scope.isFirstRound = false;
                                      // $scope.names =JSON.parse(localStorage.getItem("names"));
                                  //$scope.tournamentRound = ($scope.linkDetails[0].RoundNo) + 1;
                                     // $scope.tournamentRound = noofmatchesTemp;

                                 // }
                               
                              }
                          }
                      }
                      else {
                          if (action == 11)
                              notifierService.notifyMessage("success", "Link Send ", "Both Links have been send. !");
                          if (action == 17){
                              angular.forEach($scope.linkDetails, function (l) {
                                  angular.forEach($scope.gameDetails, function (g) {
                                      if (l.LinkStatus == g.UserIdBlack && l.OpponentIdColor == "B" && l.RoundNo == g.roundNo) {
                                          l.winnerName = l.Username;
                                          return true;
                                      }
                                      else if (l.LinkStatus == g.UserIdWhite && l.OpponentIdColor == "W" && l.RoundNo == g.roundNo) {
                                          l.winnerName = l.OpponentUsername;
                                          return true;
                                      }
                                      else if (l.LinkStatus == g.UserIdBlack && l.UserIdColor == "B" && l.RoundNo == g.roundNo) {
                                          l.winnerName = l.Username;
                                          return true;
                                      }
                                      else if (l.LinkStatus == g.UserIdWhite && l.UserIdColor == "W" && l.RoundNo == g.roundNo) {
                                          l.winnerName = l.OpponentUsername;
                                          return true;
                                      }
                                     
                                  });
                              if (l.Username == localStorage.getItem("Username") || l.OpponentUsername == localStorage.getItem("Username")) {
                                      l.isReadyToPlay = true;
                                      return true;
                                  }
                              });
                              $scope.tournamentWinnerName =angular.isDefined(_.findWhere($scope.linkDetails, { RoundNo: $scope.totalRounds }))?_.findWhere($scope.linkDetails, { RoundNo: $scope.totalRounds }).winnerName:null;
                              }

                      }

                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };

    function updateFENDetailsGame(data, action) {
        var tourId = parseInt(userPersistenceService.getCookieData("tournamentId"));
        mainService.updateGameDetailsOfPlayer("updateGameDetails", data, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.gameDetails = {};
                      $scope.gameDetails = data.data.updateGameDetailsResult;
                      var name = [];
                      var White = _.where($scope.gameDetails, { GameStatus: "White" });
                      var Black = _.where($scope.gameDetails, { GameStatus: "Black" });
                      if (White.length > 0) {
                          angular.forEach(White, function (w) {
                              angular.forEach($scope.allTournamentPlayers, function (player) {
                                  if (player.P_UserId == w.UserIdWhite)
                                      name.push(player.Username);
                              });
                          });
                      }
                      if (Black.length > 0) {
                          angular.forEach(Black, function (w) {
                              angular.forEach($scope.allTournamentPlayers, function (player) {
                                  if (player.P_UserId == w.UserIdBlack)
                                      name.push(player.Username);
                              });
                          });
                      }

                      if (Black.length == 0 && White.length == 0) {
                          //angular.forEach($scope.linkDetails, function (n) {
                          angular.forEach($scope.teams, function (item) {
                              var user = _.where($scope.linkDetails, { T_Id: tourId, Username: item });
                              var opponent = _.where($scope.linkDetails, { T_Id: tourId, OpponentUsername: item });
                              if (user.length == 0 && opponent.length == 0)
                                  $scope.names.push(item);

                          });
                          // });
                      } else {

                          angular.forEach(name, function (item) {
                              $scope.names.push(item);
                          });
                      }

                      angular.forEach($scope.linkDetails, function (l) {
                          angular.forEach($scope.gameDetails, function (g) {
                              if (l.LinkStatus == g.UserIdBlack && l.OpponentIdColor == "B" && l.RoundNo == g.roundNo) {
                                  l.winnerName = l.Username;
                                  return true;
                              }
                              else if (l.LinkStatus == g.UserIdWhite && l.OpponentIdColor == "W" && l.RoundNo == g.roundNo) {
                                  l.winnerName = l.OpponentUsername;
                                  return true;
                              }
                              else if (l.LinkStatus == g.UserIdBlack && l.UserIdColor == "B" && l.RoundNo == g.roundNo) {
                                  l.winnerName = l.Username;
                                  return true;
                              }
                              else if (l.LinkStatus == g.UserIdWhite && l.UserIdColor == "W" && l.RoundNo == g.roundNo) {
                                  l.winnerName = l.OpponentUsername;
                                  return true;
                              }
                          });
                      });


                      // notifierService.notifyRegister(" ", $scope.param.Username + " account successfully registered !");
                      //$scope.player = {};
                      //alert('Updated');
                      //$state.reload();
                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert('some error occured');
                  console.log("some error occured." + err);
              });
    };

    $scope.scheduleTournament = function (d, isPlay) {
        if (isPlay == false) {
            $rootScope.socket.emit('tournament', d);
        } else {
            //TournamentMatch({UserId:r.TableId,Round:r.RoundNo,T_Id:r.T_Id,Color:r.OpponentIdColor
            var value = d;
            localStorage.setItem("LinkDetails", JSON.stringify(d));
            $state.go('TournamentMatch', { UserId: value.TableId, Round: value.RoundNo, T_Id: value.T_Id, Color: value.OpponentIdColor });
        }
    };

    $rootScope.socket.on('tournamentPlayGame', function (data) {
        var value = data;
        localStorage.setItem("LinkDetails", JSON.stringify(data));
        if (angular.lowercase(value.Username) == angular.lowercase(localStorage.getItem("Username"))) {
            $state.go('TournamentMatch', { UserId: value.TableId, Round: value.RoundNo, T_Id: value.T_Id, Color: value.UserIdColor });
        } else if (angular.lowercase(value.OpponentUsername) == angular.lowercase(localStorage.getItem("Username"))) {
            $state.go('TournamentMatch', { UserId: value.TableId, Round: value.RoundNo, T_Id: value.T_Id, Color: value.OpponentIdColor });
        }
    });
}]);


chessApp.controller('modalController', ['$scope', function ($scope) {

}]);


chessApp.controller('logoutController', ['$scope', 'notifierService', function ($scope, notifierService) {

    $scope.init = function () {


    };


    $scope.logOut = function () {
        $scope.param = {};
        $scope.param.Username = localStorage.getItem("Username");

        mainService.LoginAuthenticatePlayer("Login", $scope.param, 17)
            .then(function (data) {
                //alert(data);
                if (data.data != null) {
                    $scope.logoutData = data.data.LoginAuthenticateResult;
                    notifierService.notifyMessage("success", "LogOut Successfully", $scope.param.Username + " Successfully Logout !");
                    localStorage.removeItem("Username");
                    localStorage.removeItem("UserId");
                    localStorage.removeItem("Id");
                    localStorage.removeItem("tableSetupSettings");
                }
                else {
                    notifierService.notifyMessage("error", "LogOut Failed", $scope.param.Username + " Username Invalid !");
                }
                //you will get "data" as a response from service
            }, function (err) {
                notifierService.notifyError();
                console.log("some error occured." + err);
            });

    };
    $scope.logOut();


}]);


chessApp.controller('TournamentMatchController', ['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$timeout', '$rootScope', '$state', '$stateParams', '$interval', 'userPersistenceService', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $timeout, $rootScope, $state, $stateParams, $interval, userPersistenceService) {
    function pieceTheme(piece) {
        // wikipedia theme for white pieces
        if (piece.search(/w/) !== -1) {
            return 'img/chesspieces/wikipedia/' + piece + '.png';
        }

        // alpha theme for black pieces
        return 'img/chesspieces/alpha/' + piece + '.png';
    }
  
    $scope.init = function () {
        $scope.username = null;
        $scope.username = localStorage.getItem("Username");
        if (!angular.isDefined($scope.username) || $scope.username==null)
            $state.go('Login');

        $scope.chessSettings = {
            snapbackSpeed: 550,
            appearSpeed: 1500,
            draggable: true,
            showNotation: false,
            dropOffBoard: 'snapback',
            onDragStart: onDragStartFunction,
            onDrop: onDragFunction,
            OnSnapEnd: onSnapEndFunction,
            onMouseoutSquare: onMouseoutSquare,
            onMouseoverSquare: onMouseoverSquare,
            pieceTheme: pieceTheme
            //pieceTheme: 'http://www.willangles.com/projects/chessboard/img/chesspieces/wikipedia/{piece}.png'
        };

        $rootScope.myMatchStart = false;
        //$rootScope.$emit('connectivity');
        var cookies = {};
        $scope.playerType = {};
        //$scope.chessboardSystem = ChessBoard($("#Div1"), $scope.chessSettings);
        //$scope.chessboardSystem.position($rootScope.fenPosition);
        var socket = "";
        //$rootScope.$emit('connectivity');
        //$rootScope.$emit("GetPlayer");
        //$scope.startmatch = false;
        $scope.chessBoardTable = [];
        //$scope.chessboardSystem = ChessBoard($("#" + id + ""), $scope.chessSettings);
        //angular.forEach($scope.onlinePlayer, function (item) {
        //    bindBoard("chessboard");
        //});
        $scope.UserIdNewParams = $stateParams.UserId;
        $scope.RoundNewParams = $stateParams.Round;
        $scope.T_IdNewParams = $stateParams.T_Id;
        $scope.ColorNewParams = $stateParams.Color;
        //$scope.myMatchStart = false;
        $scope.onlinePlayer = userPersistenceService.getChessResponse();


        $scope.isPageLoad = true;
        $scope.tableSetupSettings = {};
        //$scope.tableSetupSettings = userPersistenceService.getuserSetupSettings();
        //if($scope.tableSetupSettings==null)
        //$scope.tableSetupSettings = JSON.parse(localStorage.getItem("tableSetupSettings"));
        //$rootScope.$emit('chessTableSetup');
        $scope.counter = 0;
        $scope.counterMin = 0;
        $scope.counterSec = 0;
        $scope.filterRoom = {};
        $scope.avaiableRooms = {};
        $scope.totalRooms = {};
        $scope.RoomCreatedBy = undefined;
        $scope.filterRoom.whiteUserTime = 0;
        $scope.filterRoom.blackUserTime = 0;
        var game = new Chess();
        game.clear(true);

        $scope.pointDetails = {};
        var temp = {};
        //temp.UserId = 1;
        temp.TournamentId = $scope.T_IdNewParams;
        //getChessTablePoint(temp, 12);
        //getChessTableSetupData(temp, 12);
        getTournamentDetails(temp, 14);
        $scope.matchesdetails = {};
        //$scope.matchesdetails = JSON.parse(localStorage.getItem("matches"));
        $scope.matchesdetails = JSON.parse(localStorage.getItem("LinkDetails"));
        if ($scope.matchesdetails.UserIdColor == "W")
            $scope.matchesdetails.UserIdWhite = $scope.matchesdetails.Username;
        if ($scope.matchesdetails.OpponentIdColor == "W")
            $scope.matchesdetails.UserIdWhite = $scope.matchesdetails.OpponentUsername;
        if ($scope.matchesdetails.UserIdColor == "B")
            $scope.matchesdetails.UserIdBlack = $scope.matchesdetails.Username;
        if ($scope.matchesdetails.OpponentIdColor == "B")
            $scope.matchesdetails.UserIdBlack = $scope.matchesdetails.OpponentUsername;


        //$scope.tableConfig = JSON.parse(localStorage.getItem("tableConfig"));
        $scope.userTimeOut = false;
        getplayers();
    };


    function getChessTableSetupData(setupData, action) {
        mainService.setupChessTable("tableSetup", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.tableSetupSettings = data.data.manageChessSetupDetailsResult[0];

                  }
                  //you will get "data" as a response from service
              }, function (err) {

                  alert(err);
                  console.log("some error occured." + err);
              });
    };

    function getTournamentDetails(setupData, action) {
        mainService.manageTournamentTable("tournamentTableMethod", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.tournamentDetails = {};
                      $scope.tournamentDetails = data.data.manageTournamentTableMethodResult;
                      $scope.winningMethod = $scope.tournamentDetails[0].T_WinningMethod;

                      $scope.isPointBased = ($scope.tournamentDetails[0].T_WinningMethod == "Point Based") ? true : false;


                      getChessTablePoint({ UserId: 1 }, 12);
                      getChessTableSetupData({ UserId: 1 }, 12);
                      $timeout(function () {
                          bindBoard($scope.UserIdNewParams);

                      }, 200);
                      angular.forEach($scope.tournamentDetails, function (t) {
                          t.T_StartDate = $rootScope.ToWcfDate(t.T_StartDate);
                          t.T_EndDate = $rootScope.ToWcfDate(t.T_EndDate);
                      });


                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };




    $scope.$watch('UserIdNewParams', function (newVal, OldVal) {
        if (angular.isDefined(newVal)) {
            if (newVal) {

            }
        }
    });

    function restart() {
        game.clear(true);
        game.reset();
        $scope.chessboardSystem.clear();
        $scope.chessboardSystem.start();

        $timeout(function () {
            updateStatusFunction();

        }, 250);

    };

    function bindBoard(id) {
        //restart();
        $scope.chessboardSystem = {};
        $scope.chessboardSystem = ChessBoard($("#" + $scope.UserIdNewParams), $scope.chessSettings);
        //$(window).resize($scope.chessboardSystem.resize);
        $timeout(function () {
            //$scope.filterRoom = _.where($scope.matchesdetails, { roomId: $scope.UserIdNewParams }, true)[0];
            $scope.filterRoom = $scope.matchesdetails;
            $rootScope.$emit('roomDataEvent', $scope.filterRoom);
            if (!$scope.isPointBased) {
                $scope.filterRoom.TotalTableTimeLimit = $scope.tableSetupSettings.TotalTimeLimit * 60;
                if (angular.isDefined($scope.filterRoom)) {
                    // $rootScope.$emit('roomDataEvent', $scope.filterRoom);
                    if (angular.isUndefined($scope.filterRoom.whiteUserTime) || $scope.filterRoom.blackUserTime == 0) {
                        $scope.whitecounter = $scope.filterRoom.TotalTableTimeLimit;
                        $scope.blackcounter = $scope.filterRoom.TotalTableTimeLimit;


                    } else {
                        $scope.whitecounter = $scope.filterRoom.whiteUserTime;
                        $scope.blackcounter = $scope.filterRoom.blackUserTime;
                    }
                    // $scope.whitecounter = $scope.filterRoom.TotalTableTimeLimit;              

                }
            } else {

            }

            // $scope.RoomName = $scope.filterRoom.roomName;
            //$scope.RoomCreatedBy = $scope.filterRoom.PlayerWhite;

            restart();

        }, 150);
        //game.reset();
    };

    //$(window).resize($scope.chessboardSystem);
    //$rootScope.$on('connection', function (event, datascope,data1) {
    //    $rootScope.socket = datascope;
    //    $scope.onlinePlayer = data1.onlinePlayer;

    //});


    function updateFENDetailsGame(data, action) {
        mainService.updateGameDetailsOfPlayer("updateGameDetails", data, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.gameDetails = {};
                      $scope.gameDetails = data.data.updateGameDetailsResult;
                      if ($scope.gameDetails.length == 1) {
                          if ($scope.gameDetails[0].GameStatus != null && $scope.gameDetails[0].GameStatus != "") {
                              var temp = {};
                              temp.T_Id = $scope.gameDetails[0].T_Id;
                              temp.RoundNo = $scope.gameDetails[0].roundNo;
                              temp.GameStatus = "Finish";
                              temp.LinkStatus = ($scope.gameDetails[0].GameStatus == "White") ? $scope.gameDetails[0].UserIdWhite : $scope.gameDetails[0].UserIdBlack;
                              temp.TableId = $scope.gameDetails[0].TableId;
                              // saveRoundScoreDetails([temp], 15);  
                              $scope.currentUser = localStorage.getItem("Username");
                              temp.Username = localStorage.getItem("Username");
                              temp.OpponentUsername = localStorage.getItem("Username");;
                              saveLinkInvitaionDetails(temp, 18);
                          }
                      }
                      //updateScoreTournament();
                      // notifierService.notifyRegister(" ", $scope.param.Username + " account successfully registered !");
                      //$scope.player = {};
                      //alert('Updated');
                      //$state.reload();
                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert('some error occured');
                  console.log("some error occured." + err);
              });
    }






    $scope.flipBoard = function () {
        $scope.chessboardSystem.flip();
    };


    function goodbye(e) {
        if (!e) e = window.event;
        //e.cancelBubble is supported by IE - this will kill the bubbling process.
        e.cancelBubble = true;
        e.returnValue = 'You sure you want to leave?'; //This is displayed on the dialog

        //e.stopPropagation works in Firefox.
        if (e.stopPropagation) {
            e.stopPropagation();
            e.preventDefault();
        }
        //$rootScope.socket.emit('updateRoomFEN', d);
    }
    window.onbeforeunload = goodbye;

    /* Allow only Legal Moves of the Chess Board  */

    var game = new Chess(), statusE1 = $("#status"),
     fenE1 = $("#fen"),
     pgnE1 = $("#pgn");
    game.header('White', 'Morphy', 'Black', 'Anderssen', 'Date', '1858-09-12');
    game.clear(true);
    game.reset(true);
    //do not pick up pieces if game is over



    var onDragStartFunction = function (source, piece, position, orientation) {

        //var dRoom = _.findWhere($scope.matchesdetails, { roomId: $scope.UserIdNewParams });
        var dRoom = $scope.matchesdetails;
        //var dRoom = $scope.filterRoom;

        var d = (piece.search(/^b/) === -1) ? 'White' : 'Black';
        //console.log("Drag started:");
        //console.log("Source: " + source);
        //console.log("Piece: " + piece);
        //console.log("Position: " + $scope.chessboardSystem.fen());
        //console.log("Orientation: " +  d );
        //console.log("--------------------");
        $scope.piece = piece;




        if (dRoom.Username == localStorage.getItem("Username") || dRoom.OpponentUsername == localStorage.getItem("Username")) {
            if (game.game_over() == true || (game.turn() === 'w' && piece.search(/^b/) !== -1) || (dRoom.UserIdWhite == localStorage.getItem("Username") && game.turn() === 'b') || (dRoom.UserIdBlack == localStorage.getItem("Username") && game.turn() === 'w') ||
           (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                return false;
            } else {

            }
        } else {
            return false;
        }
        //console.log(userPersistenceService.getCookieData("boardType") + $scope.selectUserSocketId);



    };




    var onDragFunction = function (source, target) {
        //see moves is legal
        removeGreySquares();
        $scope.isPageLoad = false;
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        if (move === null) { return 'snapback'; }
        else {


            $scope.to = move.to;
            //var d = _.findWhere($scope.matchesdetails, { roomId: $scope.UserIdNewParams });
            var d = $scope.matchesdetails;
            if (!angular.isDefined(d.moveHistory)) {
                d.moveHistory = [];
                d.totalWitePlayerPoints = 0;
                d.totalBlackPlayerPoints = 0;
                d.whiteMoves = 0;
                d.blackMoves = 0;
                d.roomName = $scope.UserIdNewParams;
                d.GameStatus="";
            }
            if (game.turn() !== 'w')
                d.whiteMoves = d.whiteMoves + 1;
            else
                d.blackMoves = d.blackMoves + 1;

            if ($scope.pointDetails!=null) {
                if (angular.isDefined(move.captured) && move.color == 'b') {
                    switch (move.captured) {
                        case "p":
                            d.totalBlackPlayerPoints += $scope.pointDetails.pawn;
                            break;
                        case 'n':
                            d.totalBlackPlayerPoints += $scope.pointDetails.knight;
                            break;
                        case 'b':
                            d.totalBlackPlayerPoints += $scope.pointDetails.bishop;
                            break;
                        case 'r':
                            d.totalBlackPlayerPoints += $scope.pointDetails.rook;
                            break;
                        case 'q':
                            d.totalBlackPlayerPoints += $scope.pointDetails.queen;
                            break;
                        default:
                            break;

                    }
                } else if (angular.isDefined(move.captured) && move.color == 'w') {
                    switch (move.captured) {
                        case "p":
                            d.totalWitePlayerPoints += $scope.pointDetails.pawn;
                            break;
                        case 'n':
                            d.totalWitePlayerPoints += $scope.pointDetails.knight;
                            break;
                        case 'b':
                            d.totalWitePlayerPoints += $scope.pointDetails.bishop;
                            break;
                        case 'r':
                            d.totalWitePlayerPoints += $scope.pointDetails.rook;
                            break;
                        case 'q':
                            d.totalWitePlayerPoints += $scope.pointDetails.queen;
                            break;
                        default:
                            break;

                    }
                }
            }
            if (d.whiteMoves == 1 && d.blackMoves == 0)
                saveBoardResult();
            // var te = $scope.pointDetails;

            d.moveHistory.push(move);
            d.FEN = game.fen();
            $rootScope.socket.emit('moveOn', move, d);

        }
        updateStatusFunction();


    };


    var onSnapEndFunction = function () {
        $scope.chessboardSystem.position(game.fen());
    };

    var onMouseoutSquare = function (square, piece) {
        removeGreySquares();
    };

    var removeGreySquares = function () {
        $('#' + $scope.UserIdNewParams+' .square-55d63').css('background', '');
    };

    var onMouseoverSquare = function (square, piece) {
        //get list of possible moves for this square
        var moves = game.moves({
            square: square,
            varbose:true
        });
        // exit if there are no moves available for this square
        if (moves.length === 0) return;

        // highlight the square they moused over
        greySquare(square);

        // highlight the possible squares for this piece
        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    };

    var greySquare = function (square) {
        var squareE1 = $('#' + $scope.UserIdNewParams + '.square-' + square);
        var background = '#a9a9a9';
        if (squareE1.hasClass('black-3c85d') == true) {
            background = '#696969';
        }
        squareEl.css('background', background);
    };


    var updateStatusFunction = function () {

        boardUpdate();
        //var d = _.findWhere($scope.matchesdetails, { roomId: $scope.UserIdNewParams });
        var d = $scope.matchesdetails;
        var status = '';
        var moveColor = 'White';
        if (game.turn() === 'b') {
            moveColor = 'Black';
            if (!$scope.isPointBased) {
                $scope.countdownBlack();
                $timeout.cancel(stoppedWhite);
            }

        } else {
            if (!$scope.isPointBased) {
                $scope.countdownWhite();
                $timeout.cancel(stoppedBlack);
            }
        }
        $scope.FEN = game.fen();
        fenE1.html(game.fen());
        pgnE1.html(game.pgn());
        //verify checkmate status
        if (game.in_checkmate() === true) {
            status = 'Game Over, ' + moveColor + ' is in Checkmate.';
            notifierService.notifyMessage("info", "Checkmate", "Game Over, " + moveColor + " is in Checkmate. !");
            if (game.turn() === 'b') {
                $scope.gameStatus = 'White';
                d.totalWitePlayerPoints += $scope.pointDetails.winningPoints;

            } else {
                $scope.gameStatus = 'Black';
                d.totalBlackPlayerPoints += $scope.pointDetails.winningPoints;
            }
            if ($scope.isPointBased) {

                if (d.totalBlackPlayerPoints > d.totalWitePlayerPoints) {
                    $scope.gameStatus = 'Black';
                    // alert('Black is Winner !!');

                } else if (d.totalWitePlayerPoints > d.totalBlackPlayerPoints) {
                    //alert('White is Winner !!');
                    $scope.gameStatus = 'White';
                }
            }            
            $timeout.cancel(stoppedWhite);
            $timeout.cancel(stoppedBlack);
            if (!$scope.isPageLoad && (d.UserIdWhite == localStorage.getItem("Username") || d.UserIdBlack == localStorage.getItem("Username")) && d.GameStatus != "Start")
                saveBoardResult();


        }
            //draw condition
        else if (game.in_draw() === true) {
            status = 'Game over, drawn position';
            notifierService.notifyMessage("info", "Game Drawn", "Game over, drawn position !");
            var drawData = $scope.pointDetails.winningPoints / 2;
            d.totalWitePlayerPoints += drawData;
            d.totalWitePlayerPoints += drawData;

            if (game.turn() === 'b') {
                $scope.gameStatus = 'White drawn';


            } else {
                $scope.gameStatus = 'Black drawn';

            }
          
            $timeout.cancel(stoppedWhite);
            $timeout.cancel(stoppedBlack);
            if ((d.UserIdWhite == localStorage.getItem("Username") || d.UserIdBlack == localStorage.getItem("Username")) && d.GameStatus != "Start")
                saveBoardResult();

        }
            //game is still on
        else {
            status = moveColor + ' to move now';
            if (game.in_check() === true) {
                if (game.turn() === 'b') {
                    moveColor = 'Black';
                    $(".square-55d63 .black-3c85d .square-" + $scope.to).addClass('in-check');
                } else {
                    $(".square-55d63 .white-1e1d7 .square-" + $scope.to).addClass('in-check');
                }
                status += ', ' + moveColor + ' is in Check now';
                notifierService.notifyMessage('error', "Check Status", status + " !");
            }

        }
        if ($scope.userTimeOut == true) {

        }


        if (angular.isDefined(d)) {
            //var d = $scope.filterRoom;          
            statusE1.html(status + ' : ' + d.whiteMoves + ' : ' + d.blackMoves);
            $scope.history = d.moveHistory;
            d.GameStatus = $scope.GameStatus;
            $scope.historyCapture = _.where($scope.history);
            $scope.whitePoint = d.totalWitePlayerPoints;
            $scope.blackPoint = d.totalBlackPlayerPoints;
            $scope.isYourMove = (d.whiteMoves == d.blackMoves) ? true : false;
            $scope.$apply();

        }
        $(".scroll_this_cont").mCustomScrollbar("update");
        $timeout(function () {
            $(".scroll_this_cont").mCustomScrollbar("scrollTo", "bottom");
        }, 150);

        //$rootScope.fenPosition = game.fen();

    };




    function saveBoardResult() {
        var gameData = {};
        gameData.TableId = $scope.UserIdNewParams;
        //var d = _.findWhere($scope.matchesdetails, { roomId: $scope.UserIdNewParams });

        var d = $scope.matchesdetails;
        //var d = $scope.filterRoom;
        if (angular.isDefined(d)) {
            $scope.RoomName = d.roomName;
            gameData.RoomName = $scope.RoomName;
            var userIdOne = _.findWhere($scope.playerList, { Username: d.Username }).Id;
            var userIdTwo = _.findWhere($scope.playerList, { Username: d.OpponentUsername }).Id;
            if (d.Username == localStorage.getItem("Username") && d.UserIdColor == "W")
                gameData.UserIdWhite = userIdOne;
            else
                gameData.UserIdBlack = userIdOne;
            if (d.OpponentUsername == localStorage.getItem("Username") && d.OpponentIdColor == "W")
                gameData.UserIdWhite = userIdTwo;
            else
                gameData.UserIdBlack = userIdTwo;

            gameData.GameStatus = $scope.gameStatus;
            gameData.WhitePoint = d.totalWitePlayerPoints;
            gameData.BlackPoint = d.totalBlackPlayerPoints;

            gameData.whiteMoves = d.whiteMoves;
            gameData.blackMoves = d.blackMoves;
            gameData.roundNo = d.RoundNo;
            gameData.T_Id = d.T_Id;
            gameData.whiteTotalTime = $scope.whitecounter;
            gameData.blackTotalTime = $scope.blackcounter;
            gameData.winningMethod = $scope.winningMethod;
            gameData.moveHistory = "";
            if (d.moveHistory != null) {
                angular.forEach(d.moveHistory, function (h) {
                    angular.forEach(h, function (moveData) {
                        gameData.moveHistory += moveData + "+";
                    });
                    gameData.moveHistory += ",";
                });
                // gameData.moveHistory.slice(0, gameData.moveHistory.lastIndexOf(","));
            }

            $scope.FEN = game.fen();
            gameData.FEN = $scope.FEN;
            d.FEN = gameData.FEN;
   
            updateFENDetailsGame(gameData, 11);

        }
    };

    function boardUpdate() {
        // $timeout(function () {
        var gameData = {};
        gameData.TableId = $scope.UserIdNewParams;
        //var d = _.findWhere($scope.matchesdetails, { roomId: $scope.UserIdNewParams });
        var d = $scope.matchesdetails;
        // var d = $scope.filterRoom;
        if (angular.isDefined(d)) {
            $scope.RoomName = d.roomName;
            gameData.RoomName = $scope.RoomName;
            gameData.UserIdWhite = d.UserIdWhite;
            gameData.UserIdBlack = d.UserIdBlack;
            gameData.GameStatus = $scope.gameStatus;
            if (!$scope.isPageLoad) {
                $scope.FEN = game.fen();
                gameData.FEN = $scope.FEN;
                d.FEN = gameData.FEN;
                //updateFENDetailsGame(gameData, 11);
                //$rootScope.socket.emit('updateRoomFEN', d);                
                $rootScope.socket.emit('updateRoomFEN', d);

            }

            else {
                //updateFENDetailsGame(gameData, 12);
                //  $timeout(function () {

                if (angular.isDefined(d)) {
                    if (d.FEN == "")
                        d.FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
                    $scope.chessboardSystem.position(d.FEN);
                    game = new Chess(d.FEN);

                    //updateStatusFunction();
                }

                //  }, 150);// fen is the board layout
            }
        }

        // }, 200);
    };

    /*End Legal Moves Scripts*/




    function movePeice(msg) {
        game.move(msg);
        $scope.chessboardSystem.position(game.fen()); // fen is the board layout 
        updateStatusFunction();
    };

    // called when the server calls socket.broadcast('move')
    $rootScope.socket.on('move', function (msg, roomDetails) {
        $scope.matchesdetails = {};
        $scope.matchesdetails = roomDetails;
        if (roomDetails.Username == localStorage.getItem("Username") || roomDetails.OpponentUsername == localStorage.getItem("Username") && roomDetails.TableId == $scope.UserIdNewParams) {
            //_.extend(_.findWhere($scope.matchesdetails, { roomName: roomDetails.roomName }), roomDetails);
            $scope.isPageLoad = false;
            movePeice(msg);
            userPersistenceService.clearCookieData("boardType");
            //.setCookieData("boardType", emailid);

        } else {
            //$rootScope.socket.emit('getRooms');
            $timeout(function () {
                boardUpdate();
                updateStatusFunction();
            }, 250);
        }
    });




    $rootScope.$on('roomDataEvent', function (event, room) {

        if (angular.isDefined(room)) {
            $scope.roomDetails = room;
            if ($scope.roomDetails.UserIdColor == "W") {
                //$scope.RoomName = room.roomName;
                $scope.userIdOne = $scope.roomDetails.Username;
                $scope.userOne = "White";
            } else {
                $scope.userTwo = "Black";
                $scope.userIdTwo = $scope.roomDetails.Username;
            }
            if ($scope.roomDetails.OpponentIdColor == "W") {
                //$scope.RoomName = room.roomName;
                $scope.userIdOne = $scope.roomDetails.OpponentUsername;
                $scope.userOne = "White";
            } else {
                $scope.userTwo = "Black";
                $scope.userIdTwo = $scope.roomDetails.OpponentUsername;
            }

        }

    });


    //$rootScope.socket.on('updaterooms', function (data, room) {
    //    var username = localStorage.getItem("Username");
    //    var UserId = localStorage.getItem("UserId");
    //    $scope.rooms = data;
    //    $scope.allRooms = data;


    //    $scope.avaiableRooms = _.filter($scope.allRooms, function (item) {
    //        return _.contains(item, UserId);
    //    });

    //    //$scope.totalRooms = _.where($scope.allRooms, { isAvaiable: true });
    //    $scope.totalRooms = _.without($scope.allRooms, $scope.avaiableRooms, false);
    //    //$scope.rooms = _.without(data, { PlayerWhite: username });
    //    //$scope.rooms = _.without($scope.rooms, _.findWhere($scope.rooms, { PlayerWhite: username }, false));
    //    //$rootScope.$emit('roomAll', $scope.allRooms);
    //    $scope.$apply(function () {
    //        // $scope.rooms = data;
    //    });
    //    $scope.roomsinfo = room;
    //});


    /* *********Timer Countdown ********/
    var stoppedWhite, stoppedBlack;

    //timeout function
    //1000 milliseconds = 1 second
    //Every second counts
    //Cancels a task associated with the promise. As a result of this, the //promise will be resolved with a rejection.  

    $scope.countdownWhite = function () {
        stoppedWhite = $timeout(function () {
            //console.log($scope.whitecounter);
            if ($scope.whitecounter != 0) {
                $scope.whitecounter--;
                $scope.whitecounterMin = Math.trunc($scope.whitecounter / 60);
                $scope.whitecounterSec = $scope.whitecounter % 60;
                //var d = _.findWhere($scope.matchesdetails, { roomId: $scope.UserIdNewParams });
                var d = $scope.matchesdetails;
                //d.whiteUserTime = $scope.whitecounter;
                //_.extend(_.findWhere($scope.matchesdetails, { roomName: $scope.RoomName }), d);
                $scope.countdownWhite();
            } else {
                $scope.userTimeOut = true;
                $timeout.cancel(stoppedWhite);
            }
        }, 1000);
    };


    $scope.countdownBlack = function () {
        stoppedBlack = $timeout(function () {
            // console.log($scope.blackcounter);
            if ($scope.blackcounter != 0) {
                $scope.blackcounter--;
                $scope.blackcounterMin = Math.trunc($scope.blackcounter / 60);
                $scope.blackcounterSec = $scope.blackcounter % 60;
                //var d = _.findWhere($scope.matchesdetails, { roomId: $scope.UserIdNewParams });
                var d = $scope.matchesdetails;
                // d.blackUserTime = $scope.blackcounter;
                // _.extend(_.findWhere($scope.matchesdetails, { roomName: $scope.RoomName }), d);
                $scope.countdownBlack();
            } else {
                $scope.userTimeOut = true;
                $timeout.cancel(stoppedBlack);
            }
        }, 1000);
    };


    $scope.stop = function () {
        $timeout.cancel(stopped);

    }
    /* *********Timer End*******/


    function getChessTablePoint(setupData, action) {
        mainService.managePointTable("PointTableMethod", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      if (data.data.managePointTableMethodResult.length > 0) {
                          $scope.pointDetails = data.data.managePointTableMethodResult;
                          $scope.pointDetails = _.findWhere($scope.pointDetails, { IsDefault: true });
                      }
                  }
                  //you will get "data" as a response from service
              }, function (err) {
                  // $log.error('failure loading player', error);
                  // notifierservice.notifyerror();
                  alert(err);
                  console.log("some error occured." + err);
              });
    };


    function getplayers() {
        var promiseGet = mainService.GetDataPlayers("GetPlayers");
        promiseGet.then(function (pl) {
            $scope.playerList = pl.data.ManagePlayerResult;
        },
              function (errorPl) {
                  notifierService.notifyError();
                  $log.error('Some Error in Getting Records.', errorPl);
              });
    };



    function saveLinkInvitaionDetails(setupData, action) {      
        mainService.sendLinkInfo("sendLinkDetails", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $scope.linkDetails = {};
                      $scope.linkDetails = data.data.sendLinkDetailsResult;
                      //localStorage.setItem("LinkDetails",JSON.stringify($scope.linkDetails[0]));
                  }
                  
              }, function (err) {
               
                  alert(err);
                  console.log("some error occured." + err);
              });
    };






}]);

