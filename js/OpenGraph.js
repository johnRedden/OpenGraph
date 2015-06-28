
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
    //bootstrap tooltips
    $('[data-toggle="tooltip"]').tooltip();

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
    $("#print").click(function () {
        // clone the root svg and add a veiwBox attribute       
        var svg = board.renderer.svgRoot.cloneNode(true);
        var ww = parseInt(svg.style.width);
        var hh = parseInt(svg.style.height);
        var view = "0, 0, " +  ww + ", " + hh;
        svg.setAttribute("viewBox", view);
        
        var svgData = new XMLSerializer().serializeToString(svg);

        // The instructions linked below (viewBox seems to be important!!)
        // http://jsxgraph.uni-bayreuth.de/wp/2012/11/02/howto-export-jsxgraph-constructions/ 
        var w = window.open();
        w.document.write("<h1>Your Graph</h1>");

        var canvas = w.document.createElement("canvas");
        canvas.width = ww;
        canvas.height = hh;
        var ctx = canvas.getContext("2d");

        var img = w.document.createElement("img");
        img.setAttribute("src", "data:image/svg+xml;base64," + btoa(svgData));

        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            var png = canvas.toDataURL("image/png");
            w.document.write("<img src= "+png+" width='50%'>")
        };


    });
		
		$("#share").on("click", function(e) {
			// Variables
			var	str=	"https://rawgit.com/johnRedden/OpenGraph/master/opengraph.html?";
			
			if($(".entry")[0]=== null)
				return;
			
			$(".entry").each(function(index, elem)
			{
				if(MathQuill($(elem).find(".math-field")[0]).latex()=== "")
					return;
				if(index!= 0)
					str+=	"&";
				
				str+=	MathQuill($(elem).find(".math-field")[0]).latex();
			});
			if(str=== "https://rawgit.com/johnRedden/OpenGraph/master/opengraph.html?")
				return;
			
			$("#shareModal").modal("show").find("input#urlbox").val(str);
		});
        $('#help').on('click', function () {
            $('#helpModal').modal('show');
        });
        $('#info').on('click', function () {
            window.open('about.html', '_blank');
        });

      
 



    // -----------------------------------
    // --- OpenGraph.js Initialization ---
    // -----------------------------------

    // Page Buttons
    $("#dockButton").click(onCollapseCollapser);
    $("#header").html("<em>OpenGraphingCalculator <sub>&alpha; 0.20</sub></em>");
    $("#addNewEntry").on("click", constructNewEntry);
    $("#deleteAll").on("click", clearAll);
	$("#dockRight").on("click", collapseAll);
	
	// -------------------------------------------
	// --- OpenGraphAppEntry.js Initialization ---
	// -------------------------------------------
	
    // 1. add event listeners to the form
    $(".myForm"
    ).on("click", ".btn-remove", onRemoveClick
	).on("click", ".map", onMapClick
	).on("click", ".showColor", onShowColorClick
    ).on("mouseover", ".grabber", makeDraggable // TODO: make touch friendly
    ).on("mouseout", ".grabber", makeUnDraggable // TODO: make touch friendly
	).on("click", ".dashed", onDashedClick
	).on("click", ".mathinput", onMathInputClick
    ).on("click", ".drawer1", onDrawerClick
    ).on("click", ".drawer2", onDrawer2Click
	).on("keyup", ".entry", onEntryKeyUp
	).on("click", ".collapse-entry", onCollapseEntryClick
    ).on("click", ".thicknessPlus", onThicknessPlusClick
    ).on("click", ".thicknessMinus", onThicknessMinusClick
    ).on("click", ".tangentLine", onTangentLineClick
    ).on("click", ".derivative", onDerivativeClick
	).on("click", ".integral", onIntegralClick
    ).on("click", ".rSum", onRsumClick
    ).on("click", ".endpointMnu li a", onEndpointTypeClick
    ).on("input", ".nSlider", onSliderInput
	).on("focus", ".entry", onEntryFocus
	).on("blur", ".entry", onEntryBlur);

    // 2. Construct first entry in the form

    //set global mathquill behavior    
    MathQuill.addAutoCommands('pi theta sqrt sum');
    

    blankEntry = $(".entry"); // initial entry (global jquery Object constant)
    blankEntry.remove();
    
    constructNewEntry();
	
	if(location.hash!= "")
		updateEntry($(".entry")[0], location.hash.substring(1));
	else if(location.search!= "")
	{
		// Variables
		var	sterms=	location.search.substring(1);
		var	temp=	sterms.split('&');
		var	k=	0;
		
		for(var i= 0; i< temp.length; i++)
		{
			if(i< temp.length-1)
			{
				constructNewEntry();
			}
			updateEntry($(".entry")[k], temp[i].trim());
			k++;
		}
	}
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
function updateEntry(entry, str, usesLatex)
{
	MathQuill($(entry).find(".math-field")[0]).latex(str);
	// Simulates a key up to render the graph
	onEntryKeyUp(
	{
		target:	$(entry).find(".math-field")[0],
		keyCode:	0
	});
}

// End of File