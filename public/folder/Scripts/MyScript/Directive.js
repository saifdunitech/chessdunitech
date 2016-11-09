chessApp.directive('chessBoard', function ($parse, $compile) {
    return {
        restrict: 'EAMC',
        scope: {
            chessboardid: '@'
        },
        template: "<span data-ng-if='userTwo!=null' style='font-weight:bold;'>{{userTwo}} - {{userIdTwo}}</span><div id='{{chessboardid}}' style='width: 400px'  ></div><input type='submit' id='startGame' value='Start' data-ng-click='startGame()' /><input type='submit' id='stopGame' value='Clear' data-ng-click='clearGame()' /><input type='submit' id='flipBoard' value='Flip Board' data-ng-click='flipBoard()' /><span  data-ng-if='userOne!=null' style='font-weight:bold;'>{{userOne}} - {{userIdOne}}</span><p>Status: <span id='status'></span></p><p>FEN: <span id='fen'></span></p><p>PGN: <span id='pgn'></span></p> Id-- {{chessboardid}}",
        controller:['$scope', 'mainService', 'ChessGameService', 'toaster', 'notifierService', '$log', '$window', '$timeout', '$rootScope', function ($scope, mainService, ChessGameService, toaster, notifierService, $log, $window, $timeout, $rootScope) {

            $scope.init = function () {
                $scope.chessSettings= {
                    snapbackSpeed: 550,
                    appearSpeed: 1500,
                    draggable: true,
                    dropOffBoard: 'snapback',
                    onDragStart: onDragStartFunction,
                    onDrop: onDragFunction,
                    OnSnapEnd: onSnapEndFunction


                };
                //$scope.chessboardSystem = ChessBoard($("#"+$scope.chessboardid+""), $scope.chessSettings);
                console.log($scope.chessboardid);
                //$scope.chessboardSystem = ChessBoard($("#Div1"), $scope.chessSettings);
                //$scope.chessboardSystem.position($rootScope.fenPosition);
                var socket = "";
                $rootScope.$emit("GetPlayer");
                //$scope.startmatch = false;
                $scope.chessBoardTable = [];
                bindBoard($scope.chessboardid);
            };

            function bindBoard(id) {
                $scope.chessboardSystem = ChessBoard($("#" + id), $scope.chessSettings);
            };

            //$(window).resize($scope.chessboardSystem);
           $rootScope.$on('connection', function (event, datascope, data1) {
               $rootScope.socket = datascope;
               $scope.dataFromController = data1;
               $scope.onlinePlayer = data1.onlinePlayer;
               $timeout(function () {
                   $scope.init();
               }, 3000);
           });

   

            // called when the server calls socket.broadcast('move')
            $rootScope.socket.on('move', function (msg) {
                game.move(msg);
                $scope.chessboardSystem.position(game.fen()); // fen is the board layout
                updateStatusFunction();
            });


            $scope.startGame = function () {

                //$('#startGame').on('click', $scope.chessboardSystem.start);
                //$rootScope.socket.emit('generate_uuid', 'My Id: ')


                $scope.chessboardSystem.start();
            };
            $scope.clearGame = function () {
                //$('#stopGame').on('click', $scope.chessboardSystem.clear);   
                $scope.chessboardSystem.clear();
                game.reset();
                updateStatusFunction();

            };

            $scope.flipBoard = function () {
                $scope.chessboardSystem.flip();
            };
  

 

            /* Allow only Legal Moves of the Chess Board  */

            var game = new Chess(), statusE1 = $("#status"),
             fenE1 = $("#fen"),
             pgnE1 = $("#pgn");
            game.header('White', 'Morphy', 'Black', 'Anderssen', 'Date', '1858-09-12');

            //do not pick up pieces if game is over

            var onDragStartFunction = function (source, piece, position, orientation) {
                if (game.game_over() == true || (game.turn() === 'w' && piece.search(/^b/) !== -1 ) ||
                    (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
                    return false;
                }
            };




            var onDragFunction = function (source, target) {
                //see moves is legal
                var move = game.move({
                    from: source,
                    to: target,
                    promotion: 'q'
                });

                if (move === null) return 'snapback';
                else $rootScope.socket.emit('moveOn', move);
                //updateStatusFunction();
            };


            var onSnapEndFunction = function () {
                $scope.chessboardSystem.position(game.fen());
            };

            $rootScope.socket.on('myMatch', function (data) {
                //alert(data.msg);
                // $("#matchBoard").html(data.msg);
                //$scope.chessBoardTable.push({ path: "folder/Templates/chess.htm" });
                $scope.startmatch = true;
                //$scope.dataFromController.startmatch = true;
                console.log('Connected successfully to the client message');
                //_.defer(function () {
                //    $scope.$apply();
                //});
            });



            var updateStatusFunction = function () {
                var status = '';
                var moveColor = 'White';
                if (game.turn() === 'b') {
                    moveColor = 'Black';
                }
                statusE1.html(status);
                fenE1.html(game.fen());
                pgnE1.html(game.pgn());
                //verify checkmate status
                if (game.in_checkmate() === true) {
                    status = 'Game Over, ' + moveColor + ' is in Checkmate.';
                    notifierService.notifyMessage("info", "Checkmate", "Game Over, " + moveColor + " is in Checkmate. !");

                }
                    //draw condition
                else if (game.in_draw() === true) {
                    status = 'Game over, drawn position';
                    notifierService.notifyMessage("info", "Game Drawn", "Game over, drawn position !");

                }
                    //game is still on
                else {
                    status = moveColor + ' to move now';
                    if (game.in_check() === true) {
                        status += ', ' + moveColor + ' is in Check now';
                        notifierService.notifyMessage('error', "Check Status", status + " !");
                    }

                }



                //$rootScope.fenPosition = game.fen();

            };

            /*End Legal Moves Scripts*/
            updateStatusFunction();









        }],
        link: function (scope, iElement, iAttrs, ctrl) {

            //scope.getTemp(iAttrs.ngCity);
            function appendHtml() {
                if (scope.chessboardid) {
                    var newElement = angular.element(scope.chessboardid);
                    $compile(newElement)(scope);
                    iElement.append(newElement);
                }
            }

            scope.$watch(function () { return scope.chessboardid }, appendHtml);
        }        
    }
});

chessApp.directive('jqdatepicker', function ($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {     

            element.datepicker({
                dateFormat: 'dd/mm/yy',
                onSelect: function (date) {
                    var ar = date.split("/");
                    date = new Date(ar[2] + "-" + ar[1] + "-" + ar[0]);
                    ngModelCtrl.$setViewValue(date.getTime());
                    scope.$apply();
                }
            });
            ngModelCtrl.$formatters.unshift(function (v) {
                return $filter('date')(v, 'dd/MM/yyyy');
            });
        }


    };
});



chessApp.directive('autoComplete', function($timeout) {
    return function (scope, iElement, iAttrs, ngModel) {
        iElement.autocomplete({
            source: scope[iAttrs.uiItems],
            minLength: 0,
            select: function () {             
                $timeout(function () {
                    scope.$apply(function () {
                        iElement.trigger('input');                
                    });
                }, 0);
            }
        }).focus(function () {
    
                    $(this).autocomplete("search", $(this).val());
              
        });
      
    }
});


chessApp.directive('timepickerPop', function($document) {
    return {
        restrict : 'E',
        transclude : false,
        scope : {
            inputTime : "=",
            showMeridian : "="
        },
        controller : function($scope, $element) {
            $scope.isOpen = false;

            $scope.toggle = function() {
                $scope.isOpen = !$scope.isOpen;
            };

            $scope.open = function() {
                $scope.isOpen = true;
            };
        },
        link : function(scope, element, attrs) {
            scope.$watch("inputTime", function(value) {
                if (!scope.inputTime) {
                    element.addClass('has-error');
                } else {
                    element.removeClass('has-error');
                }

            });

            element.bind('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
            });

            $document.bind('click', function(event) {
                scope.$apply(function() {
                    scope.isOpen = false;
                });
            });

        },
        template : "<input type='text' class='form-control' ng-model='inputTime'  time-format show-meridian='showMeridian' ng-focus='open()' />"
            + "  <div class='input-group-btn' ng-class='{open:isOpen}'> "
            + "    <button type='button' class='btn btn-default ' ng-class=\"{'btn-primary':isOpen}\" data-toggle='dropdown' ng-click='toggle()'> "
            + "        <i class='fa fa-clock-o'></i></button> "
            + "          <div class='dropdown-menu pull-right'> "
            + "            <timepicker ng-model='inputTime' show-meridian='showMeridian'></timepicker> "
            + "           </div> " + "  </div>"
    };
});

chessApp.directive("timeFormat", function ($filter) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            showMeridian: '=',
        },
        link: function (scope, element, attrs, ngModel) {
            var parseTime = function (viewValue) {

                if (!viewValue) {
                    ngModel.$setValidity('time', true);
                    return null;
                } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                    ngModel.$setValidity('time', true);
                    return viewValue;
                } else if (angular.isString(viewValue)) {
                    var timeRegex = /^(0?[0-9]|1[0-2]):[0-5][0-9] ?[a|p]m$/i;
                    if (!scope.showMeridian) {
                        timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    }
                    if (!timeRegex.test(viewValue)) {
                        ngModel.$setValidity('time', false);
                        return undefined;
                    } else {
                        ngModel.$setValidity('time', true);
                        var date = new Date();
                        var sp = viewValue.split(":");
                        var apm = sp[1].match(/[a|p]m/i);
                        if (apm) {
                            sp[1] = sp[1].replace(/[a|p]m/i, '');
                            if (apm[0].toLowerCase() == 'pm') {
                                sp[0] = sp[0] + 12;
                            }
                        }
                        date.setHours(sp[0], sp[1]);
                        return date;
                    };
                } else {
                    ngModel.$setValidity('time', false);
                    return undefined;
                };
            };

            ngModel.$parsers.push(parseTime);

            var showTime = function (data) {
                parseTime(data);
                var timeFormat = (!scope.showMeridian) ? "HH:mm" : "hh:mm a";
                return $filter('date')(data, timeFormat);
            };
            ngModel.$formatters.push(showTime);
            scope.$watch('showMeridian', function (value) {
                var myTime = ngModel.$modelValue;
                if (myTime) {
                    element.val(showTime(myTime));
                }

            });

        }
    };
});
