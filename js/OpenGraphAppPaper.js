
/// <reference path="jsxgraphcore.js" />

// Variables
var board;
var resizeTimer;

// Called when the page is ready and loaded
$(document).ready(function () {
    board = JXG.JSXGraph.initBoard('myBox',
	{
	    boundingbox: [-10, 12, 10, -10],
	    axis: { ticks: { drawLabels: true }, firstArrow: true, strokeColor: 'black' },
	    grid: { strokeWidth: 0.75 },
	    showCopyright: false,
	    showNavigation: false,
	    keepaspectratio: true, //square graph coming in
	    zoom:
		{
		    wheel: true,
		    needshift: false
		},
	    pan: 
		{
		    enabled: true,   // Allow panning
		    needTwoFingers: false, // panningis done with two fingers on touch devices
		    needshift: false // mouse panning needs pressing of the shift key
		}
	});
    board.resizeContainer($(window).width(), $(window).height()); //init resize
    centerOrigin(); // init center
   
    board.on("move", onBoardMovement);

    $("#resetHome").click(function () {
        centerOrigin();
    });
    $("#resetZoom").click(function () {
        board.zoom100();
    });
    $("#zoomIn").click(function () {
        board.zoomIn();
    });
    $("#zoomOut").click(function () {
        board.zoomOut();
    });
    // Called when the zoom type / toggle zoom type button has been clicked
    $("#toggleZoomType").click(function () {
        // Variables
        var zt = $("#zoomType").text().trim().toLowerCase();

        switch (zt) {
            case "xy":
                $("#zoomType").html("&nbsp;x");
                board.attr.zoom.factorx = 1.25;
                board.attr.zoom.factory = 1.0;
                break;
            case "x":
                $("#zoomType").html("&nbsp;y");
                board.attr.zoom.factorx = 1.0;
                board.attr.zoom.factory = 1.25;
                break;
            case "y":
                $("#zoomType").html("xy");
                board.attr.zoom.factorx = 1.25;
                board.attr.zoom.factory = 1.25;
                break;
        }
    });
});

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