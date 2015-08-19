

// Variables
var	siteType=	"desktop";

// Called when the page is ready and loaded
$(document).ready(function()
{
	// -------------------------------------------
	// --- OpenGraphAppPaper.js Initialization ---
	// -------------------------------------------
	
    bMobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera\smini/i).test(navigator.userAgent.toLowerCase());
    //global jsxGraph options
    JXG.Options.text.fontSize = 12;
    //JXG.Options.renderer = 'canvas';  //Can use canvas instead of SVG default

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
    $('[data-toggle="tooltip"]').tooltip({
		container: "body"
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
		
		$("#share,#encodeNorm,#encodeFull").on("click", function(e) {
			// Variables
			var	str=	"http://www.opengraphingcalculator.com/?readType=";
			var	bTextOnly=	($("#encodeNorm").prop("checked")== true);
			
			if($(".entry")[0]=== null)
				return;
			if(bTextOnly)
				str+=	"text&";
			else
				str+=	"full&";
			
			$(".entry").each(function(index, elem)
			{
				if(MathQuill($(elem).find(".math-field")[0]).latex()=== "")
					return;
				if(index!= 0)
					str+=	"&";
				
				if(bTextOnly)
					str+=	escape(MathQuill($(elem).find(".math-field")[0]).latex());
				else
					str+=	escape(fullEncode($(elem)));
			});
			if(str=== "http://www.opengraphingcalculator.com/?readType=text&")
				str=	"http://www.opengrapgingcalculator.com/";
			if(str=== "http://www.opengraphingcalculator.com/?readType=full&")
				str=	"http://www.opengraphingcalculator.com/";
			
			$("#shareModal").modal("show").find("input#urlbox").val(str);
		});
		$("#encodeNorm").on("click", function(e) {
			$("#descNorm").show();
			$("#descFull").hide();
		});
		$("#encodeFull").on("click", function(e) {
			$("#descNorm").hide();
			$("#descFull").show();
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
    $("#header").html("<em>OpenGraphingCalculator.com <sub>&alpha; 0.35</sub></em>");
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
	).on("keyup", ".mathinput", onEntryKeyUp
	).on("keydown", ".mathinput", onEntryKeyDown
    ).on("keyup", ".numA", onNumAKeyUp
    ).on("keyup", ".numB", onNumBKeyUp
	).on("click", ".collapse-entry", onCollapseEntryClick
    ).on("click", ".thicknessPlus", onThicknessPlusClick
    ).on("click", ".thicknessMinus", onThicknessMinusClick
    ).on("click", ".tangentLine", onTangentLineClick
    ).on("click", ".derivative", onDerivativeClick
    ).on("click", ".secondDerivative", onSecondDerivativeClick
	).on("click", ".integral", onIntegralClick
    ).on("click", ".rSum", onRsumClick
    ).on("click", ".endpointMnu li a", onEndpointTypeClick
    ).on("input", ".nSlider", onSliderInput
	).on("focus", ".entry", onEntryFocus
	).on("blur", ".entry", onEntryBlur);

    // 2. Construct first entry in the form

    //set global mathquill behavior
	/*
		-	Adding nthroot makes things a bit trickier, doesn't size well with the height
		-	Figure out if we could implement union somehow or if we even need to
	*/
    MathQuill.addAutoCommands('pi theta sqrt sum');
    

    blankEntry = $(".entry"); // initial entry (global jquery Object constant)
    blankEntry.remove();
    
    constructNewEntry();
	
	if(location.search!= "")
	{
		// Variables
		var	temp=	(location.search).substring(1);
		var readType=	0;
		var	skip=	-1;
		var	k=	0;
		
		temp=	temp.split("&");
		for(var i= 0; i< temp.length; i++)
		{
			if(temp[i].toLowerCase().indexOf("readtype=")!== -1)
			{
				// Variables
				var	temp2=	temp[i].split("=");
				
				switch(temp2[1].trim().toLowerCase())
				{
					case "text":	readType=	0;	break;
					case "full":	readType=	1;	break;
					case "iframe":	readType=	2;	break;
				}
				skip=	i;
				
				break;
			}
		}
		for(var i= 0; i< temp.length; i++)
		{
			if(i=== skip)
				continue;
			temp[i]=	unescape(temp[i]);
			if(readType=== 1)
				temp[i]=	fullDecode(temp[i]);
			if(i< temp.length-1)
			{
				constructNewEntry();
			}
			if(readType=== 0)
				updateEntry($($(".entry")[k]), temp[i], null);
			else if(readType=== 1)
				updateEntry($($(".entry")[k]), temp[i].latex, temp[i].options);
			else
			{
				convertSiteTo("iframe");
				updateEntry($($(".entry")[k]), temp[i], null);
			}
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

function convertSiteTo(idType)
{
	if(siteType=== "iframe") // Doesn't mess with it's orientation if it is a legit iframe
		return;
	
	switch(idType.toLowerCase())
	{
		case "iframe":
			$(".myForm").hide();
			$("#top-header").hide();
			$("#entry-tools").hide();
			$("#graphPaperButtons").hide();
			break;
		case "mobile":	break;
		case "normal":
		case "desktop":
			break;
	}
	siteType=	idType.toLowerCase();
}

// Updates the given entry with the given latex and options
function updateEntry(entry, latex, options)
{
	MathQuill(entry.find(".math-field")[0]).latex(latex);
	
	// Simulates a key up to render the graph
	onEntryKeyUp(
	{
		target:	entry.find(".math-field")[0],
		keyCode:	0
	});
	
	if(options)
	{
		if(options.color)
		{
			entry.find(".showColor").css({"color": options.color});
			if(entry[0].graphRef)
			{
				(entry[0].graphRef).setAttribute({strokeColor: options.color});
				if(JXG.isPoint(entry[0].graphRef))
					(entry[0].graphRef).setAttribute({fillColor: options.color});
			}
		}
		if(options.strokeWidth)
		{
			if(entry[0].graphRef)
			{
				(entry[0].graphRef).setAttribute({strokeWidth: options.strokeWidth});
			}
		}
		if(options.rsdir)
			entry.find(".menuTxt").html(options.rsdir);
		if(options.rsnum)
		{
			entry.find(".nSlider").val(options.rsnum);
			entry.find(".nDisplay").html(" "+options.rsnum+" ");
		}
		if(options.varA)
			entry.find(".numA").val(options.varA);
		if(options.varB)
			entry.find(".numB").val(options.varB);
		
		// Simulates a key up to render the graph
		onEntryKeyUp(
		{
			target:	entry.find(".math-field")[0],
			keyCode:	0
		});
		
		if(options.dash)
		{
			entry.find(".dashed").click();
		}
		if(options.calculus)
		{
			if((options.calculus&1)!== 0)
				onTangentLineClick({target:entry.find(".math-field")[0]});
			if((options.calculus&2)!== 0)
				onDerivativeClick({target:entry.find(".math-field")[0]});
			if((options.calculus&4)!== 0)
				onSecondDerivativeClick({target:entry.find(".math-field")[0]});
			if((options.calculus&8)!== 0)
				onIntegralClick({target:entry.find(".math-field")[0]});
			if((options.calculus&16)!== 0)
				onRsumClick({target:entry.find(".math-field")[0]});
		}
		if(options.mps)
		{
			if(entry[0].graphRef && !JXG.isPoint(entry[0].graphRef))
			{
				for(var i= 0; i< options.mps.length; i++)
				{
					var	pt=	board.create("glider",
						[options.mps[i].locX, options.mps[i].locY, entry[0].graphRef],
						{color: entry.find(".showColor").css("color"), name: options.mps[i].id}
					).on("up", function(e)
					{
						if(e.which=== 3)
						{
							try {
								board.removeObject(this);
							}catch(err){}
						}
					});
					
					alert(options.mps[i].locX);
					pt.moveTo([options.mps[i].locX, options.mps[i].locY]);
				}
			}
		}
	}
}

// Encodes the given entry into a self made encoding
function fullEncode(entry)
{
	// Variables
	var	encoding=	"";
	var	redundency=	0;
	var	calculus=	0;
	var	attr=	{};
	
	/*
		So I had a brilliant idea for better sharing, it is a compressed version of the representation of the entry.
		Essentially it is a meta code put into chunks, so for each part of the API, the app can read the code and interpret it.
		Meaning that we should be able to have map points and everything in there. So the following is how the code is pieced together.
		
		It is pieced by characters:
		
		char 1: redunency checker (Hard to explain, but flags anything that is default or uncaught so it lowers the length of the url)
		char 2: calculus flags { 1 = tangent line, 2 = derivative, 4 = second derivative, 8 = integral, 16 = riemanns sum }
		char 3: color { 0 = SlateGray, 1 = RoyalBlue, 2 = SeaGreen, 3 = Violet, 4 = Coral }
		char 4: stroke width
		char 5: riemanns sum's direction { 0 = right, 1 = left, 2 = center, 3 = trapezoid, 4 = lower, 5 = upper }
		char 6: riemanns sum's number of rectangles, represented by a char datatype
		chars 7, 8: riemann's 'a' variable as 2 characters to represent a very small float
		chars 9, 10: riemann's 'b' variable as 4 characters to represent a very small float
		chars 11, 12: tangent line's variable as 4 characters to represent a very small float
		char 13: map point chunk size
		char 14+n*3: map point chunks
		everything else after that is the text for the entry
		
		Here's where it gets a little more complex, after the 20th character, it starts to chunk stuff of 5:
		
		chunk char 1: map point id { example: "A" or "B" } (Used into a stack call or something so it doesn't have a leak when shared)
		chunk chars 2, 3: map point's x variable as 4 characters to represent a very small float
		
		This should compact things nicely, without taking an entire paragraph of json or something to get more information.
		
		By very small float, I mean a float with max 128 and min 128... Should we go with a regular float and increase the size of the thing by 2?
		
		DO NOT DELETE THIS UNLESS WE ARE SCRAPPING THE ENCODER, this is here for a reference point.
	*/
	
	// Getting the attributes of the entry
	if(entry[0].graphRef)
	{
		attr.dash=	(entry[0].graphRef).getAttribute("dash"); // Don't know why attribute doesn't want to respond most of the time
		attr.strokeColor=	(entry[0].graphRef).getAttribute("strokeColor");
		attr.strokeWidth=	(entry[0].graphRef).getAttribute("strokeWidth");
	}
	else
	{
		attr.dash=	entry[0].dashed;
		attr.strokeColor=	entry.find(".showColor").css("color");
		attr.strokeWidth=	2;
	}
	attr.temp=	null;
	
	// Setting if any of the calculus stuff is pressed to the encoding
	if(entry[0].isTangentDisplayed)
		calculus|=	1;
	if(entry[0].isDerivDisplayed)
		calculus|=	2;
	if(entry[0].is2DerivDisplayed)
		calculus|=	4;
	if(entry[0].isIntegralDisplayed)
		calculus|=	8;
	if(entry[0].isRsumDisplayed)
		calculus|=	16;
	
	// Setting the color to the encoding
	switch(attr.strokeColor)
	{
		case "SlateGray":	encoding+=	"0";	break;
		case "RoyalBlue":	encoding+=	"1";	break;
		case "SeaGreen":	encoding+=	"2";	break;
		case "Violet":	encoding+=	"3";	break;
		case "Coral":	encoding+=	"4";	break;
		default:	redundency|=	1;	break;
	}
	
	// Setting the stroke width to the encoding
	switch(attr.strokeWidth)
	{
		case 2:	redundency|=	2;	break;
		case 10:	encoding+=	"a";	break;
		case 11:	encoding+=	"b";	break;
		default:	encoding+=	attr.strokeWidth.toString();	break;
	}
	
	// Setting if it is dashed to the encoding
	if(attr.dash== 0)
		redundency|=	4;
	
	// Setting the direction selected for the riemann's sums
	switch(entry.find(".menuTxt").html().toLowerCase().trim())
	{
		case "right":	redundency|=	8;	break;
		case "left":	encoding+=	"1";	break;
		case "middle":	encoding+=	"2";	break;
		case "trapezoidal":	encoding+=	"3";	break;
		case "lower":	encoding+=	"4";	break;
		case "upper":	encoding+=	"5";	break;
		default:	redundency|=	8;	break;
	}
	
	// Setting the number of riemanns sum rectangles
	attr.temp=	parseInt(entry.find(".nDisplay").html());
	if(attr.temp=== 10)
		redundency|=	16;
	else
		encoding+=	String.fromCharCode(attr.temp);
	
	// Setting the number for riemanns sum 'a'
	attr.temp=	parseFloat(entry.find(".numA").val());
	if(attr.temp=== 1)
		redundency|=	32;
	else
		encoding+=	stringFloat(entry.find(".numA").val());
	
	// Setting the number for riemanns sum 'b'
	attr.temp=	parseFloat(entry.find(".numB").val());
	if(attr.temp=== 2)
		redundency|=	64;
	else
		encoding+=	stringFloat(entry.find(".numB").val());
	
	// Seting the number for the size of the map point chunks
	attr.temp=	getMapPoints(entry);
	if(attr.temp.length=== 0)
		redundency|=	128;
	else
	{
		encoding+=	String.fromCharCode(attr.temp.length);
		for(var i= 0; i< attr.temp.length; i++)
			encoding+=	attr.temp[i].toString();
	}
	encoding+=	MathQuill(entry.find(".math-field")[0]).latex();
	encoding=	String.fromCharCode(redundency)+String.fromCharCode(calculus)+encoding;
	
	return encoding;
}

// Decodes the given special encoding
function fullDecode(encoding)
{
	// Variables
	var	redundency=	encoding.charCodeAt(0);
	var	calculus=	encoding.charCodeAt(1);
	var	options=	{};
	
	options.calculus=	calculus;
	encoding=	encoding.substring(2);
	if((redundency&1)=== 0) // Finds if the color was not redundent
	{
		switch(encoding.charAt(0))
		{
			case "0":	options.color=	"SlateGray";	break;
			case "1":	options.color=	"RoyalBlue";	break;
			case "2":	options.color=	"SeaGreen";	break;
			case "3":	options.color=	"Violet";	break;
			case "4":	options.color=	"Coral";	break;
		}
		encoding=	encoding.substring(1);
	}
	if((redundency&2)=== 0) // Finds if the stroke width was not redundent
	{
		switch(encoding.charAt(0))
		{
			case "a":	options.strokeWidth=	10;	break;
			case "b":	options.strokeWidth=	11;	break;
			default:	options.strokeWidth=	parseInt(encoding.charAt(0));	break;
		}
		encoding=	encoding.substring(1);
	}
	if((redundency&4)=== 0)
		options.dash=	true;
	if((redundency&8)=== 0)// Finds if the riemann's sum's direction was not redundent
	{
		switch(encoding.charAt(0))
		{
			case "1":	options.rsdir=	"left";	break;
			case "2":	options.rsdir=	"center";	break;
			case "3":	options.rsdir=	"trapezoidal";	break;
			case "4":	options.rsdir=	"lower";	break;
			case "5":	options.rsdir=	"upper";	break;
		}
		encoding=	encoding.substring(1);
	}
	if((redundency&16)=== 0) // Finds if the riemann's sum's number of rectangles was not redundent
	{
		options.rsnum=	parseInt(encoding.charCodeAt(0));
		encoding=	encoding.substring(1);
	}
	if((redundency&32)=== 0) // Finds if the 'a' variable was not redundent
	{
		options.varA=	pieceFloat(encoding.charCodeAt(0), encoding.charCodeAt(1), encoding.charCodeAt(2), encoding.charCodeAt(3));
		encoding=	encoding.substring(4);
	}
	if((redundency&64)=== 0)  // Finds if the 'b' variable was not redundent
	{
		options.varB=	pieceFloat(encoding.charCodeAt(0), encoding.charCodeAt(1), encoding.charCodeAt(2), encoding.charCodeAt(3));
		encoding=	encoding.substring(4);
	}
	if((redundency&128)=== 0) // Finds if the map points was not redundent
	{
		options.mps=	new Array();
		options.temp=	encoding.charCodeAt(0);
		encoding=	encoding.substring(1);
		for(var i= 0; i< options.temp; i++)
		{
			options.mps.push({
				id:	encoding.charAt(0),
				locX:	pieceFloat(encoding.charCodeAt(1), encoding.charCodeAt(2), encoding.charCodeAt(3), encoding.charCodeAt(4)),
				locY:	pieceFloat(encoding.charCodeAt(5), encoding.charCodeAt(6), encoding.charCodeAt(7), encoding.charCodeAt(8))
			});
			encoding=	encoding.substring(9);
		}
	}
	
	return {
		options:	options,
		latex:	encoding
	};
}

// Pieces together the coded float
function pieceFloat(b1, b2, b3, b4)
{
	// Variables
	var	ab=	new ArrayBuffer(4);
	var	u8=	new Uint8Array(ab);
	var	dv;
	
	u8[0]=	parseInt(b1);
	u8[1]=	parseInt(b2);
	u8[2]=	parseInt(b3);
	u8[3]=	parseInt(b4);
	dv=	new DataView(ab);
	
	return dv.getFloat32(0);
}

// Get all the map points for url use
function getMapPoints(entry)
{
	// Variables
	var	d=	(entry[0].graphRef).childElements;
	var	results=	new Array();
	
	for(elem in d)
	{
		if(d[elem].getType()== "glider")
		{
			if(entry[0].isTangentDisplayed)
			{
				if(d[elem]=== entry[0].isTangentDisplayed)
					continue;
			}
			if(entry[0].isIntegralDisplayed)
			{
				if(d[elem]=== entry[0].isIntegralDisplayed.curveLeft)
					continue;
				if(d[elem]=== entry[0].isIntegralDisplayed.curveRight)
					continue;
			}
			results.push(d[elem].getName()+stringFloat(d[elem].X(0.1))+stringFloat(d[elem].Y(0.5)));
		}
	}
	
	return results;
}

// Strings together a two digit code resembling a float that has a max of 128 and min 128
function stringFloat(strFloat)
{
	// Variables
	var	ab=	new ArrayBuffer(4);
	var	u8=	new Float32Array(ab);
	var	dv;
	
	u8[0]=	parseFloat(strFloat);
	dv=	new DataView(ab);
	
	return String.fromCharCode(dv.getUint8(0))+String.fromCharCode(dv.getUint8(1))+String.fromCharCode(dv.getUint8(2))+String.fromCharCode(dv.getUint8(3));
}

// End of File