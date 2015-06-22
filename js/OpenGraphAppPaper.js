
/// <reference path="jsxgraphcore.js" />

// Variables
var board;
var resizeTimer;

// Centers the origin
function centerOrigin() {
    board.moveOrigin($(window).width() / 2.0, $(window).height() / 2.0);
};
// Resizes the graphing board
function resizeBoard() {
    var bb = board.getBoundingBox();

    board.resizeContainer($(window).width(), $(window).height(), false, true); //the true = do not call setBoundingBox
    board.setBoundingBox(bb, false);  //false = keep aspect ratio and same bb as coming in
}

// Resizes the board when the window has been resized
$(window).resize(resizeBoard);

// Gets the mouse coordinates
// Do you think we still need this??
function getMouseCoords(e, i) {
    // Variables
    var cPos = board.getCoordsTopLeftCorner(e, i);  //always 0,0 ??
    var abPos = JXG.getPosition(e, i);
    var dx = abPos[0] - cPos[0];
    var dy = abPos[0] - cPos[0];

    return [dx, dy];//new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
}

// Called whenever there is a movement detected
function onBoardMovement(e) {
    board.update();
}

// End of File