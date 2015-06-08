
/// <reference path="jsxgraphcore.js" />
// Variables
var board;
var resizeTimer;
var bMobile;
var movement = new function () { };

movement.x = null;
movement.y = null;
movement.down = false;

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
   
    board.on("down", onMobileDown);
    board.on("up", function () { movement.down = false; });
    board.on("move", onMobileMovement);

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
    
    $("#m-entry").css("display", "none");
}

// Resizes the graphing board for mobile viewage
function resizeBoardMobile() {
    var bb = board.getBoundingBox();

    board.resizeContainer($(window).width(), $(window).height() * 0.75);
    board.setBoundingBox(bb, false);

    //show input box mobile
    $("#m-entry").css("display", "block"
	).css("top", $(window).height() * 0.75
	).css("width", $(window).width()
	).css("height", $(window).height() * 0.25);
}

// Called when the window has been resized
$(window).resize(function () {
    bMobile = true;//(navigator.appVersion.toLowerCase().indexOf("android"))!= -1; // Looks for only android

    if (!bMobile) {
        resizeBoard();/* Don't know why you need a timer (efficiency??)
		clearTimeout(resizeTimer);
		resizeTimer=	setTimeout(function()
		{
			resizeBoard();
		}, 200);*/
    }
    else {
        resizeBoardMobile();
    }
});

// Gets the mouse coordinates
function getMouseCoords(e, i) {
    // Variables
    var cPos = board.getCoordsTopLeftCorner(e, i);  //always 0,0 ??
    var abPos = JXG.getPosition(e, i);
    var dx = abPos[0] - cPos[0];
    var dy = abPos[0] - cPos[0];

    return [dx, dy];//new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
}

// Called whenever there is a touch detected
function onMobileDown(e) {
    if (!bMobile)
        return;

    // Variables
    var mPos = getMouseCoords(e, 0);

    movement.x = mPos[0];
    movement.y = mPos[1];
    movement.down = true;
}

// Called whenever there is a touched movement detected
function onMobileMovement(e) {
    if (!bMobile)
        return;
    if (!movement.down)
        return;

    board.update();  // need this to force mobile to update... that's all!  How many hours wasted?

}

// End of File