    chessApp.service("ChessGameService", function ($http) {

        this.post = function (url,Player) {
            var request = $http({
                method: "post",
                url: url+"/AddNewPlayer",
                data: Player
            });
            return request;
        }
        this.getAllPlayers = function (url) {
            var request = $http({
                method: "GET",
                url: url+"/GetPlayers/",
                data: {}
            });
            return request;
        }


    });

    // common factory to call WCF service

    chessApp.factory('mainService', function ($http, $q) {
        var deferred;
        deferred=$q.defer();
        return mainService = {
            endpoint: 'http://104.197.167.53/chessService/ChessDetailsService.svc/',
            //endpoint: 'http://108.170.59.98/chessService/ChessDetailsService.svc/',
          //endpoint: 'http://192.168.1.4/ChessService/ChessDetailsService.svc/',
          // endpoint: 'http://localhost:2753/ChessDetailsService.svc/',

          
          
            PostData: function (col, params,id) {
               return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ player: params, action: id }),
                   headers: { "Content-Type": "application/json"},
                    dataType: "json"//Data sent to server
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject(e);
                });

                return deferred.promise;
            },
            GetDataPlayers: function (col) {
                return $http({
                    url: this.endpoint + "/"+col+"/",
                    method: "GET",
                    data: {}, //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });

                return deferred.promise;
            },

            LoginAuthenticatePlayer: function (col, params,actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ player: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });

                return deferred.promise;
            },
            updateGameDetailsOfPlayer: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ gameDetails: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });

                return deferred.promise;
            },
            setupChessTable: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ tableSetup: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });

                return deferred.promise;
            },

            //admin login

            adminLogin: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ admin: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });

                return deferred.promise;
            },

            manageTournamentTable: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ tourTable: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });

                return deferred.promise;
            },

            manageTournamentDetails: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ tourDetails: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });

                return deferred.promise;
            },

            managePointTable: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ pointTable: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });
                return deferred.promise;
            },

            manageRoundDetailsTable: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ roundscore: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });
                return deferred.promise;
            },
            saveRoundDetails: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ rDetails: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });
                return deferred.promise;
            },
            sendLinkInfo: function (col, params, actionType) {
                return $http({
                    url: this.endpoint + col,
                    method: "POST",
                    data: JSON.stringify({ linkData: params, action: actionType }), //Data sent to server
                    headers: { "Content-Type": "application/json" },
                    dataType: "json"
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (e) {
                    deferred.reject();
                });
                return deferred.promise;
            },



                socketConnection: function () {
//var host = window.location.hostname; 
//var socket = io.connect('http://' + host);
                    var socket = io.connect("/", { 'transports': ['websocket', 'polling'] });
                    //var socket = io();

                    return socket;
                },




            facebookService : function(){
                //return FB.api('/me', { fields: 'last-name' },
                //    function(response){
                //        if(!response || response.error){
                //            deferred.reject('Error Occured Facebook login');
                //        }else{
                //            deferred.resolve(response);
                //        }
                //    });
                //return deferred.promise;

                return FB.login(function (response) {
                    if (response.authResponse) {
                        console.log('Welcome!  Fetching your information.... ');
                        FB.api('/me', function (response) {
                            console.log('Good to see you, ' + response.name + '.');
                        });
                    } else {
                        console.log('User cancelled login or did not fully authorize.');
                    }
                });
            }

        }
    });

    chessApp.factory('notifierService', function (toaster) {
        return {
            notify: function (toatertype,msg) {
                toaster.pop('success', 'Update Successful', 'The ' + msg + ' setting was updated');
            },
            notifyError: function (msg) {
                toaster.pop('error', 'Something Went Wrong', 'Please check with an administrator or Service.');
            },
            notifyInfo: function (toatertype,msg) {
                toaster.pop('info', 'Information', 'The ' + msg + 'just happened');
            },
            notifyMessage: function (toatertype, toatertitle, msg) {
                toaster.pop(toatertype, toatertitle, msg);
            },
            notifyRegister: function (toatertype,msg) {
                toaster.pop('success', 'Player Registration', msg);
            }
        };
    });

    chessApp.factory('DataService', function () {
        return {
            isEmpty: function (data) {
                if (angular.isUndefined(data) || data == '' || data == null || data=='Undefined')
                    return true;
                else
                    return false;
            }
        }
    });



    chessApp.factory("userPersistenceService", [
        "$cookies", function ($cookies) {
            var chessResponse = {};
            var userSocketData = {};
            var userSetupSettings = {};
            return {
                setCookieData: function (cookieName, data) {
                    $cookies.put(cookieName, data);
                },
                getCookieData: function (cookieName) {
                   // console.log($cookies.get(cookieName));
                    return $cookies.get(cookieName);
                },
                clearCookieData: function (cookieName) {
                    $cookies.remove(cookieName);

                },
                saveChessResponse: function (data) {
                    chessResponse = data;
                   // console.log(data);
                },
                getChessResponse: function () {
                    return chessResponse;
                },
                saveUserSocketDataResponse: function (data) {
                    userSocketData = data;
                   // console.log(data);
                },
                getUserSocketDataResponse: function () {
                    return userSocketData;
                },
                saveuserSetupSettings: function (data) {
                    userSetupSettings = data;
                    //console.log(data);
                },
                getuserSetupSettings: function () {
                    return userSetupSettings;
                }

            }
        }
    ]);

    chessApp.factory('responseObserver', function responseObserver($q, $window) {
        return {
            'responseError': function(errorResponse) {
                switch (errorResponse.status) {
                    case 403:
                        $window.location = './403.html';
                        break;
                    case 500:
                        $window.location = './500.html';
                        break;
                }
                return $q.reject(errorResponse);
            }
        };
    });


    chessApp.factory('uuid', function () {
        var svc = {
            new: function () {
                function _p8(s) {
                    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
                }
                return _p8() + _p8(true) + _p8(true) + _p8();
            },

            empty: function () {
                return '00000000-0000-0000-0000-000000000000';
            }
        };

        return svc;
    });
    //chessApp.factory('socket', ['$rootScope', function ($rootScope) {
    //    var socket = io.connect();

    //    return {
    //        on: function (eventName, callback) {
    //            socket.on(eventName, callback);
    //        },
    //        emit: function (eventName, data) {
    //            socket.emit(eventName, data);
    //        }
    //    };
    //}]);

    //chessApp.factory('socket', function ($rootScope) {
    //    var socket = io.connect();
    //    return {
    //        on: function (eventName, callback) {
    //            socket.on(eventName, function () {
    //                var args = arguments;
    //                $rootScope.$apply(function () {
    //                    callback.apply(socket, args);
    //                });
    //            });
    //        },
    //        emit: function (eventName, data, callback) {
    //            socket.emit(eventName, data, function () {
    //                var args = arguments;
    //                $rootScope.$apply(function () {
    //                    if (callback) {
    //                        callback.apply(socket, args);
    //                    }
    //                });
    //            })
    //        }
    //    };
    //});

//    chessApp.directive('fb', ['$FB', function($FB) {
//        return {
//            restrict: "E",
//            replace: true,
//            template: "<div id='fb-root'></div>",
//            compile: function(tElem, tAttrs) {
//                return {
//                    post: function(scope, iElem, iAttrs, controller) {
//                        var fbAppId = iAttrs.appId || '';

//                        var fb_params = {
//                            appId: iAttrs.appId || "",
//                            cookie: iAttrs.cookie || true,
//                            status: iAttrs.status || true,
//                            xfbml: iAttrs.xfbml || true
//                        };

//                        // Setup the post-load callback
//                        window.fbAsyncInit = function() {
//                            $FB._init(fb_params);

//                            if('fbInit' in iAttrs) {
//                                iAttrs.fbInit();
//                            }
//                        };

//                        (function(d, s, id, fbAppId) {
//                            var js, fjs = d.getElementsByTagName(s)[0];
//                            if (d.getElementById(id)) return;
//                            js = d.createElement(s); js.id = id; js.async = true;
//                            js.src = "//connect.facebook.net/en_US/all.js";
//                            fjs.parentNode.insertBefore(js, fjs);
//                        }(document, 'script', 'facebook-jssdk', fbAppId));
//                    }
//                }
//            }
//        };
//    }]);

//chessApp.factory('$FB', ['$rootScope', function($rootScope) {

//            var fbLoaded = false;

//            // Our own customisations
//            var _fb =  {
//                loaded: fbLoaded,
//                _init: function(params) {
//                    if(window.FB) {
//                        // FIXME: Ugly hack to maintain both window.FB
//                        // and our AngularJS-wrapped $FB with our customisations
//                        angular.extend(window.FB, _fb);
//                        angular.extend(_fb, window.FB);

//                        // Set the flag
//                        _fb.loaded = true;

//                        // Initialise FB SDK
//                        window.FB.init(params);

//                        if(!$rootScope.$$phase) {
//                            $rootScope.$apply();
//                        }
//                    }
//                }
//            }

//            return _fb;
//}]);


