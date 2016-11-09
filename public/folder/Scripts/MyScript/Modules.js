
var chessApp = angular.module("App", [
    'ui.router',
    'ngAnimate',
    'toaster',
    'ngMessages',
    'ngTable',
    'ngSanitize',
    'ngCookies',
    'angularMoment',
    'ui.bootstrap',
    'timer'
    
])
.run(function ($rootScope, $timeout, toaster, $window, mainService, userPersistenceService, uuid) {
    $rootScope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $rootScope.getRandomSpanUUID = function () {
        return uuid.new();
    }

    $rootScope.ToJsonDate = function (date) {
        if (date != null) {
            date = new Date(date);
            return '\/Date(' + date.getTime() + '+0000)\/';
        }
    };

    $rootScope.ToWcfDate = function (jsondate) {
        if (jsondate != null) {
            jsondate = jsondate.replace("/Date(", "").replace(")/", "");
            if (jsondate.indexOf("+") > 0) {
                jsondate = jsondate.substring(0, jsondate.indexOf("+"));
            } else if (jsondate.indexOf("-") > 0) {
                jsondate = jsondate.substring(0, jsondate.indexOf("-"));
            }

            var date = new Date(parseInt(jsondate, 10));
            var month = date.getMonth() + 1 < 10 ?
                "0" + (date.getMonth() + 1) : date.getMonth() + 1;
            var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
            return date;
        }
    };





    $rootScope.currentUser = localStorage.getItem("Username");
    $rootScope.$on("ShowLoading", function (event, message, progress) {
        $rootScope.IND_loading = true;
        $rootScope.IND_loadingMessage = message;
        $rootScope.IND_loadingProgress = progress;
    });
    $rootScope.$on('HideLoading', function () {
        $rootScope.IND_loading = false;
    });
    //$rootScope.socket = mainService.socketConnection();

    if ($rootScope.socket == null) {
        connectivitySocket();
    }
    function connectivitySocket() {
      //var socket = mainService.socketConnection();
        //socket.emit('join', { email: $scope.param.Username });
        //$rootScope.socket = {};
        //$rootScope.socket = socket;
        $rootScope.socket =mainService.socketConnection();
        //$(window).resize($scope.chessboardSystem);
       // $rootScope.$emit('socketData', socket);
    };

 
    $rootScope.$on('connectivity', function (data) {
        connectivitySocket();
        $timeout(function () {
            $rootScope.$emit('socketData', $rootScope.socket);
        }, 250);

    });

    $rootScope.$on('reloadConnection', function () {      
        $timeout(function () {
            $rootScope.$emit('socketData', $rootScope.socket);
        }, 250);        
    });


    function getChessTableSetupData(setupData, action) {
        mainService.setupChessTable("tableSetup", setupData, action)
              .then(function (data) {
                  //alert(data);
                  if (data != null) {
                      $timeout(function () {
                         // $scope.tableSetupDetails = data.data.manageChessSetupDetailsResult;
                          var dataSetup = _.findWhere(data.data.manageChessSetupDetailsResult, { IsDefault: true });
                          localStorage.setItem('tableConfig', JSON.stringify(dataSetup));
                
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
    $rootScope.$on('chessTableSetup', function () {
        var temp = {};
       temp.UserId = localStorage.getItem("UserId");
        //temp.UserId = 39;
        if (temp.UserId != null) {
            $timeout(function () {
                if (angular.isDefined(temp.UserId))
                    getChessTableSetupData(temp, 12);
            }, 250);
        }
    });


    $rootScope.socket.on('onconnected', function (data) {
        //Note that the data is the object we sent from the server, as is. So we can assume its id exists. 
     //   $scope.userId = data.id;
      //  $scope.socketId = data.SocketId;
       // $scope.userBoardType = "W";
        console.log('Connected successfully to the socket.io server. My server side ID is ' + data.id);


        //$scope.onlinePlayer = data.OnlinePlayer;
        //$scope.onlinePlayer = _.where($scope.onlinePlayer, {UserId : $scope.userId},true);
        //var data=localStorage.getItem("UserId");
        //$scope.OnlinePlayer.splice($scope.OnlinePlayer.indexOf(data), 1);
        //console.log('Connected successfully to the socket.io server. My server side ID is ' + $scope.onlinePlayer[0].UserId);
       // localStorage.removeItem("UserId");
       // localStorage.setItem("UserId", $scope.userId);
       // var data1 = $scope;
        //angular.forEach($scope.allPlayerOnline, function (items) {
        //    if ($scope.username == items.Username) {
        //        items.socketId = $scope.socketId;
        //    }
        //});
        //$scope.allPlayeFilterOnline = _.without($scope.allPlayerOnline, _.findWhere($scope.allPlayerOnline, { Username: $scope.username }, false));
        userPersistenceService.saveChessResponse(data.OnlinePlayer);
        userPersistenceService.saveUserSocketDataResponse(data);
        localStorage.removeItem("UserInfoSocketId");
        localStorage.setItem("UserInfoSocketId", data.SocketId);
        localStorage.removeItem("UserInfoId");
        localStorage.setItem("UserInfoId", data.id);
        $timeout(function () {
            $rootScope.$emit('connection', $rootScope.socket, data);
        }, 200);

    });

    $window.fbAsyncInit = function () {
        FB.init({
            appId: '275741332781987',
            status: true,
            cookie: true,
            xfbml: true,
            version: 'v2.7'
        });
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s); js.id = id;
        js.src = "folder/Chessboard/all.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));



})
var configSettings = function ($stateProvider, $urlRouterProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/Login');

    $stateProvider.
    state('Register', {
        url: '/Register',
        views: {
            'content': {
                templateUrl: "folder/Templates/Register.html",
                controller: "ChessGameController"
            }
        }

    }).
    state('GetPlayer', {
        url: '/GetPlayer',
        views: {
            'header': {
                templateUrl: 'folder/Templates/header.html'
            },
            'content': {
                templateUrl: "folder/Templates/AllPlayer.html",
                controller: "ChessGameController"
            }
        }

    }).
    state('ChessBoard', {
        url: '/ChessBoard',
        views: {
            'header': {
                templateUrl: 'folder/Templates/header.html'
            },
            'content': {
                templateUrl: "folder/Templates/ChessBoard.html",
                controller: "ChessConnectionController"
            }
        }

    }).
      state('Login', {
          url: '/Login',
          views: {
              'content': {
                  templateUrl: "folder/Templates/Login.html",
                  controller: "LoginController"
              }
          }

      }).
            state('Logout', {
                url: '/Logout',
                views: {
                    'content': {
                        templateUrl: "folder/Templates/logout.html",
                        controller: "logoutController"
                    }
                }

            }).
    state('Lobby', {
        url: '/Lobby',
        views: {
            'header': {
                templateUrl: 'folder/Templates/header.html'
            },
            'content': {
                templateUrl: "folder/Templates/Lobby.html",
                controller: "LobbyController"
            }
        }

    }).
      state('Play', {
          url: '/Play',
          views: {
              'header': {
                  templateUrl: 'folder/Templates/header.html'
              }
          },
          templateUrl: "folder/Templates/PlayGame.html",
          controller: "LoginController"
      }).
      state('Index', {
          url: '/Index',
          views: {
              'header': {
                  templateUrl: 'folder/Templates/header.html'
              }
          },
          templateUrl: "public/default.html",
          controller: "IndexController"

      }).
        state('Game', {
            url: '/Game/:UserId',
            views: {
                'header': {
                    templateUrl: 'folder/Templates/header.html'
                },
                'content': {
                    templateUrl: "folder/Templates/chess.html",
                    controller: "ChessBoardController"
                }
            }

        }).
            state('SetupTable', {
                url: '/SetupTable',
                views: {
                    'header': {
                        templateUrl: 'folder/Templates/Admin/header.html'
                    }, 'content': {
                        templateUrl: "folder/Templates/Admin/SetupTable.html",
                        controller: "SetupTableController"
                    }
                }

            }).
         state('SetupUserTable', {
             url: '/SetupUserTable',
             views: {
                 'header': {
                     templateUrl: 'folder/Templates/header.html'
                 }, 'content': {
                     templateUrl: "folder/Templates/Admin/SetupTable.html",
                     controller: "SetupTableController"
                 }
             }

         }).
           state('allTournament', {
               url: '/allTournament',
               views: {
                   'header': {
                       templateUrl: 'folder/Templates/Admin/header.html'
                   }, 'content': {
                       templateUrl: "folder/Templates/Admin/alltournament.html",
                       controller: "allTournamentController"
                   }
               }

           }).
         state('myTournamentMatches', {
             url: '/myTournamentMatches',
             views: {
                 'header': {
                     templateUrl: 'folder/Templates/header.html'
                 }, 'content': {
                     templateUrl: "folder/Templates/myTournamentMatches.html",
                     controller: "allTournamentController"
                 }
             }

         }).
    state('AdminLogin', {
        url: '/AdminLogin',

        views: {            
            'content': {
                templateUrl: "folder/Templates/Admin/AdminLogin.html",
                controller: "AdminLoginController"
            }
        }


    }).
            state('TournamentMatch', {
                url: '/TournamentMatch/:UserId/:Round/:T_Id/:Color',

                views: {
                    'header': {
                        templateUrl: 'folder/Templates/header.html'
                    },
                    'content': {
                        templateUrl: "folder/Templates/TournamentMatch.html",
                        controller: "TournamentMatchController"
                    }
                }


            }).


          state('admindashboard', {
              url: '/admindashboard',
              views: {
                  'header': {
                      templateUrl: 'folder/Templates/Admin/header.html'
                  },
                  'content': {
                      templateUrl: "folder/Templates/Admin/admindashboard.html"

                  }


              }
          }).
          state('chessPoint', {
              url: '/chessPoint',
              views: {
                  'header': {
                      templateUrl: 'folder/Templates/Admin/header.html'
                  },
                  'content': {
                      templateUrl: "folder/Templates/Admin/ChessTablePoint.html",
                      controller: "ChessPointTableController"

                  }


              }
          }).
          state('chessUserPoint', {
              url: '/chessUserPoint',
              views: {
                  'header': {
                      templateUrl: 'folder/Templates/header.html'
                  },
                  'content': {
                      templateUrl: "folder/Templates/Admin/ChessTablePoint.html",
                      controller: "ChessPointTableController"

                  }


              }
          }).
          state('TournamentSetup', {
              url: '/TournamentSetup',
              views: {
                  'header': {
                      templateUrl: 'folder/Templates/Admin/header.html'
                  },
                  'content': {
                      templateUrl: "folder/Templates/Admin/TournamentSetup.html",
                      controller: "TournamentSetupController"

                  }


              }
          }).
            state('tournamentList', {
                url: '/tournamentList',
                views: {
                    'header': {
                        templateUrl: 'folder/Templates/header.html'
                    },
                    'content': {
                        templateUrl: "folder/Templates/tournament.html",
                        controller: "allTournamentController"

                    }


                }
            });
    
    
    $httpProvider.interceptors.push('responseObserver');
   // console.log($httpProvider.interceptors.responseObserver);
}
configSettings.$inject = [
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider'
];

chessApp.config(configSettings);



  