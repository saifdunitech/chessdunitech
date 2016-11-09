$(document).ready(function() {
var board;
var game;

window.onload = function () {
    //initGame();
};

var initGame = function() {
   var cfg = {
       draggable: true,
       position: 'start',
       onDrop: handleMove,
   };

   board = new ChessBoard($("#gameBoard" ), cfg);
   game = new Chess();
};

var handleMove = function(source, target ) {
    var move = game.move({from: source, to: target});

    if (move === null)  return 'snapback';
};

var socket = io.connect();

//window.onclick = function(msg) {
 //  socket.emit('moveOn', msg);
//};

var handleMove = function(source, target) {
    var move = game.move({from: source, to: target});

    if (move === null)  return 'snapback';
    else socket.emit('moveOn', move);

};
// called when the server calls socket.broadcast('move')
socket.on('move', function (msg) {
    game.move(msg);
    board.position(game.fen()); // fen is the board layout
});

});