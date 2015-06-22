
// Called when the page is ready and loaded
$(document).ready(function()
{
	// -------------------------------------------
	// --- OpenGraphAppPaper.js Initialization ---
	// -------------------------------------------
	
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
	
	// -------------------------------------------
	// --- OpenGraphAppEntry.js Initialization ---
	// -------------------------------------------
	

    $(".entry")[0].graphRef;
	$(".entry")[0].color=	nextColor(); // can use color getAttribute the eliminate this variable too (requires a bit of redesign)
	$(".entry")[0].dashed=	false;  // can use getAttribute instead of this.. TODO: eliminate this variable
	$(".entry").draggable({ disabled: true, containment: 'document' }); // only want to drag in grabber: TODO: Make mobile friendly

	blankEntry = $(".entry");
	//or
	template = $(".entry")[0]; 

	console.log($(".entry"));
	console.log($(".entry")[0]);

	entryFocusMath($(".entry")[0]);  // what is more efficient?  pass $('.entry') or $(".entry")[0] ??
	displayColorToEntry($(".entry"));  // same issue should be consistent when passing arguments.
	
	$(".myForm").on("click", ".btn-remove", onRemoveClick
	).on("click", ".map", onMapClick
	).on("click", ".showColor", onShowColorClick
    ).on("mouseover", ".grabber", makeDraggable // TODO: make touch friendly
    ).on("mouseout", ".grabber", makeUnDraggable // TODO: make touch friendly
	).on("click", ".dashed", onDashedClick
	).on("click", ".mathinput", onMathInputClick
    ).on("click", ".drawer1", onDrawerClick
	).on("keyup", ".entry", onEntryKeyUp
	).on("click", ".collapse-entry", onCollapseEntryClick
    ).on("click", ".thicknessPlus", onThicknessPlusClick
    ).on("click", ".thicknessMinus", onThicknessMinusClick
    ).on("click", ".tangentLine", onTangentLineClick
    ).on("click", ".derivative", onDerivativeClick
    ).on("click", ".roots", onRootsClick);


	$("#addNewEntry").on("click", onNewEntryClick);
	$("#deleteAll").on("click", clearAll);
	
	// -----------------------------------
	// --- OpenGraph.js Initialization ---
	// -----------------------------------
	
	// Also OpenGraph's on load function gets called first, because it was positioned before the entry one
	
	//if(location.hash!= "")
		//updateEntry($(".entry")[0], location.hash.substring(1));
		
	$("#dockButton").click(onCollapseCollapser);
	$("#header").html("<em>OpenGraphingCalculator <sub>&alpha; 0.15</sub></em>");
    //Init MathQuill
	$('.math-field').each(function () { MathQuill.MathField(this); });
	MathQuill.addAutoCommands('pi theta sqrt sum');
	
});

// Called when the collapser has collapsed a collapsible collapser
function onCollapseCollapser(e)
{
	// Variables
	var	parent=	$($(e.target).parents(".controlContainer")[0]);
	var	cc=	parent.find(".buttons")[0];
	
	if(cc.style.visibility== "hidden")
	{
		cc.style.visibility=	"visible";
		cc.style.display=	"block";
		$(this).find(".glyphicon").removeClass("glyphicon-menu-left").addClass("glyphicon-menu-right");
	}
	else
	{
		cc.style.visibility=	"hidden";
		cc.style.display=	"none";
		$(this).find(".glyphicon").removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left");
		parent.css({right: "0px"});
	}
}

// Writes into the given entry with the given string
function updateEntry(entry, str)
{
	try{
	MathQuill($(entry).find(".math-field")[0]).typedText(str);
	renderGraph(entry);
	} catch (e) {
        // use console.log()
	    //$("#header").text(e.message + " :: " + MathQuill($(".math-field")[0]));
	}
}

// End of File