/// <reference path="bootstrap.js" />

// Variables
var	colors=	['SlateGray', 'RoyalBlue', 'SeaGreen', 'Violet', 'Coral'];
var	n=	0;
var blankEntry;

// Constructs the new entry
function constructNewEntry() {

    var lastEntry = null;
    if ($(".entry").length > 0)
        lastEntry = $($(".entry")[$(".entry").length - 1]);
    
    var newEntry = blankEntry.clone().appendTo('.myForm');

    newEntry[0].graphRef = null;
    newEntry.draggable({ disabled: true, containment: 'document' }); // only want to drag in grabber: TODO: Make mobile friendly
    newEntry.find(".showColor").css({ 'color': nextColor() });
    
    // mathquillify the math-field and focus it
    MathQuill.MathField(newEntry.find('.math-field')[0]).focus();

    if (lastEntry != null)
        newEntry.offset({ top: lastEntry.offset().top + lastEntry.height() + 36, left: lastEntry.offset().left });
    if (newEntry.offset().top + newEntry.height() > $(window).height()) {
        // Variables
        var offset = newEntry.offset();

        newEntry.offset({ top: 85, left: offset.left + 64, right: offset.right, bottom: offset.bottom });
    }
    if (newEntry.offset().left < 0) {
        newEntry.offset({ left: 1 });
        //newEntry.find(".collapse-entry").find(".glyphicon").removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left");
    }

}

// Called whenever there is a key detected on an entry input
function onEntryKeyUp(e) {
	// Variables
    var currEntry = $(e.target).parents(".entry");
	
    if (e.keyCode === 13) {  //enter
        constructNewEntry();
    }else{
		// Variables
		var	obj=	catchEntryText(currEntry, e.keyCode);
		
		// I could not think of a way to make it just the entry go through
		if(obj.canGraph)
			renderGraph(currEntry, obj.text);
    }
}

// Filters the given text from messed up syntax
function filterText(txt, entry, key)
{
	// Gets hyperbolic functions by default
	txt = txt.toLowerCase()
			.replace(/\*\*[\*]?/g, "^")
			.replace(/cdot\s/g, "*")
			.replace(/\\s\*i\*n[\s]*[\*]?/g, "sin")
			.replace(/\\c\*s\*c[\s]*[\*]?/g, "csc")
			.replace(/\\c\*o\*s[\s]*[\*]?/g, "cos")
			.replace(/\\s\*e\*c[\s]*[\*]?/g, "sec")
			.replace(/\\t\*a\*n[\s]*[\*]?/g, "tan")
			.replace(/\\c\*o\*t[\s]*[\*]?/g, "cot")
			.replace(/\\operatorname\{c\*s\*c\*h}[\*]?/g, "csch")
			.replace(/\\operatorname\{s\*e\*c\*h}[\*]?/g, "sech")
			.replace(/\\l\*o\*g[\s]*[\*]?/g, "log")
			.replace(/\\l\*n[\s]*[\*]?/g, "ln")
			.replace(/t\*r\*i\*a\*n\*g\*l\*e[\*]?/g, "triangle")
			.replace(/q\*u\*a\*d[\*]?/g, "quad")
			.replace(/l\*i\*n\*e[\*]?/g, "line")
			.replace(/c\*i\*r\*c\*l\*e[\*]?/g, "circle")
			.replace(/e\*l\*l\*i\*p\*s\*e[\*]?/g, "ellipse")
			.replace(/p\*a\*r\*a\*b\*o\*l\*a[\*]?/g, "parabola")
			.replace(/h\*y\*p\*e\*r\*b\*o\*l\*a[\*]?/g, "hyperbola")
			.replace(/\s\*/g, ""); // Had to take this out, messed things up
	
	if((key== 104 || key== 72) && txt.length>= 6) // Looks for 'h' or 'H'
	{
		switch(txt.substring(txt.length-6))
		{
			case "sin(h)":
			case "csc(h)":
			case "cos(h)":
			case "sec(h)":
			case "tan(h)":
			case "cot(h)":
				MathQuill(entry.find(".math-field")[0]).latex(""); // Deletes everything on the entry
				txt=	txt.substring(0, txt.length-3)+"h("; // Formulates everything to make it hyperbolic
				MathQuill(entry.find(".math-field")[0]).typedText(txt); // Rewrites everything back on
				break;
		}
	}
	else if(key!= 8 && key!= 127) // Else if they are not pressing backspace or delete, so there is no fighting
	{
		if(txt.length>= 3)
		{
			switch(txt.substring(txt.length-3))
			{
				case "sin":
				case "csc":
				case "cos":
				case "sec":
				case "tan":
				case "cot":
				case "log":
					MathQuill(entry.find(".math-field")[0]).typedText("("); // Acts as if the user typed in a parenthesis instead
					break;
			}
		}
		if(txt.length>= 2)
		{
			switch(txt.substring(txt.length-2))
			{
				case "ln":
					MathQuill(entry.find(".math-field")[0]).typedText("(");
					break;
			}
		}
	}
	
	//$("#header").text(txt); // Live view of whats going on
	
	if(txt.indexOf(",")!== -1)
	{
		txt=	txt.replace(/[\*]?[\s]*,[\s]*[\*]?/g, ",").replace(/[\(\[]/g, "").replace(/[\)\]]/g, "");
		txt=	txt.split(",");
		
		return {point: txt};
	}
	if(txt.indexOf("x=")!== -1)
	{
		return {vline: txt.substring(2)};
	}
    /*
	if(txt.indexOf("y=")!== -1)
	{
		return {hline: txt.substring(2)};
	}
    */
	if(txt.indexOf("triangle")!== -1)
	{
		txt=	txt.substring(8).toUpperCase();
		txt=	txt.split("*");
		
		return {triangle: txt};
	}
	if(txt.indexOf("quad")!== -1)
	{
		txt=	txt.substring(4).toUpperCase();
		txt=	txt.split("*");
		
		return {quad: txt};
	}
	if(txt.indexOf("line")!== -1)
	{
		txt=	txt.substring(4).toUpperCase();
		txt=	txt.split("*");
		
		return {line: txt};
	}
	if(txt.indexOf("circle")!== -1)
	{
		txt=	txt.substring(6).toUpperCase();
		txt=	txt.split("*");
		
		return {circle: txt};
	}
	if(txt.indexOf("ellipse")!== -1)
	{
		txt=	txt.substring(7).toUpperCase();
		txt=	txt.split("*");
		
		return {ellipse: txt};
	}
	if(txt.indexOf("parabola")!== -1)
	{
		txt=	txt.substring(8).toUpperCase();
		txt=	txt.split("*");
		
		return {parabola: txt};
	}
	if(txt.indexOf("hyperbola")!== -1)
	{
		txt=	txt.substring(9).toUpperCase();
		txt=	txt.split("*");
		
		return {hyperbola: txt};
	}
	
	
	return txt;
}

// special cases
function catchEntryText(entry, key) {
	
	// Variables
	var	txt=	"";
	var	bGraph=	false;
	
	try
	{
		txt=	MathQuill(entry.find(".math-field")[0]).text();
		txt=	filterText(txt, entry, key);
		
		if
		(
			txt.triangle || txt.quad || txt.hline ||
			txt.point || txt.vline || txt.line || txt.circle || txt.ellipse || txt.parabola || txt.hyperbola
		)
		{
			return {
				text:	txt,
				canGraph:	true
			};
		}
		
		// Finds if it is graphable, unsure if we should detect here, or in the render function
		try
		{
			// Variables
			var	userFunction;
			eval("userFunction= function(x) { with(Math) return "+mathjs(txt)+" }");
			if(JXG.isFunction(userFunction))
				bGraph=	true;
		}catch(e){console.log("caught "+e);}
	}
	catch(e)
	{
		console.log("caught "+e);
		bGraph=	false;
	}
	
	return {
		text:	txt,
		canGraph:	bGraph
	};
}

// Re renders any lines on the graph
function reRenderLines()
{
	$(".entry").each(function(index, elem)
	{
		// Variables
		var	txt=	MathQuill($(elem).find(".math-field")[0]).text();
		
		if
		(
			txt.indexOf("l*i*n*e")!== -1 || txt.indexOf("c*i*r*c*l*e")!== -1 ||
			txt.indexOf("e*l*l*i*p*s*e")!== -1 || txt.indexOf("p*a*r*a*b*o*l*a")!== -1 ||
			txt.indexOf("h*y*p*e*r*b*o*l*a")!== -1 || txt.indexOf("t*r*i*a*n*g*l*e")!== -1 ||
			txt.indexOf("q*u*a*d")!== -1
		)
		{
			onEntryKeyUp({
				target: $(elem).find(".math-field")[0],
				keyCode: 0
			});
		}
	});
}

// Renders the graph
function renderGraph(entry, txt)
{
	// Variables
    var userFunction;
	var	attr=	{};
	
	if(entry[0].graphRef)
	{
		attr.dash=	(entry[0].graphRef).getAttribute("dash");
		attr.strokeColor=	(entry[0].graphRef).getAttribute("strokeColor");
		attr.strokeWidth=	(entry[0].graphRef).getAttribute("strokeWidth");
	}
	
	if(txt.point)
	{
		// Render point
		try {
			removeFromGraph(entry);
			entry[0].graphRef=	board.create("point", [txt.point[0], txt.point[1]],
			{
				visible: true,
				strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
				strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
				fillColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
			});
		}
		catch(e) { $("#header").text(e); console.log("caught "+e); }
		reRenderLines();
		
		return;
	}
	if(txt.vline)
	{
		// Render vertical line
		try {
			removeFromGraph(entry);
			entry[0].graphRef=	board.create("line", [-1*parseInt(txt.vline), 1, 0],
			{
				visible: true,
				strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
				strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
                fixed: false  //can make this true for VLT
			}).on('drag', function (e) {
				// Variables
				var	lx=	this.X(0.5).toFixed(2);
				
				if(lx== "-0.00")
					lx="0.00"
				
				MathQuill(entry.find(".math-field")[0]).latex("").typedText("x="+lx);
			});
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	if(txt.hline)
	{
		// Render horizontal line
		try {
			removeFromGraph(entry);
			entry[0].graphRef=	board.create("line", [-1*parseInt(txt.hline), 0, 1],
			{
				visible: true,
				strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
				strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
                fixed: false  //can make this true for VLT
			}).on('drag', function (e) {
				// Variables
				var	ly=	this.Y(0.5).toFixed(2);
				
				if(ly== "-0.00")
					ly="0.00"
				
				MathQuill(entry.find(".math-field")[0]).latex("").typedText("y="+ly);
			});
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	if(txt.triangle)
	{
		// Render triangle
		try {
			// Variables
			var	ptA=	board.select(txt.triangle[0]);
			var	ptB=	board.select(txt.triangle[1]);
			var	ptC=	board.select(txt.triangle[2]);
			
			removeFromGraph(entry);
			if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
			{
				entry[0].graphRef=	board.create("polygon", [ptA, ptB, ptC],
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
				});
			}
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	if(txt.quad)
	{
		// Render triangle
		try {
			// Variables
			var	ptA=	board.select(txt.quad[0]);
			var	ptB=	board.select(txt.quad[1]);
			var	ptC=	board.select(txt.quad[2]);
			var	ptD=	board.select(txt.quad[3]);
			
			removeFromGraph(entry);
			if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC) && JXG.isPoint(ptD))
			{
				entry[0].graphRef=	board.create("polygon", [ptA, ptB, ptC, ptD],
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
				});
			}
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	if(txt.line)
	{
		// Render line
		try {
			// Variables
			var	ptA=	board.select(txt.line[0]);
			var	ptB=	board.select(txt.line[1]);
			
			removeFromGraph(entry);
			if(JXG.isPoint(ptA) && JXG.isPoint(ptB))
			{
				entry[0].graphRef=	board.create("line", [ptA, ptB],
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
				});
			}
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	if(txt.circle)
	{
		// Render circle
		try {
			// Variables
			var	ptA=	board.select(txt.circle[0]);
			var	ptB=	board.select(txt.circle[1]);
			
			removeFromGraph(entry);
			if(JXG.isPoint(ptA) && JXG.isPoint(ptB))
			{
				entry[0].graphRef=	board.create("circle", [ptA, ptB],
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
				});
			}
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	if(txt.ellipse)
	{
		// Render ellipse
		try {
			// Variables
			var	ptA=	board.select(txt.ellipse[0]);
			var	ptB=	board.select(txt.ellipse[1]);
			var	ptC=	board.select(txt.ellipse[2]);
			
			removeFromGraph(entry);
			if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
			{
				entry[0].graphRef=	board.create("ellipse", [ptA, ptB, ptC],
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
				});
			}
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	if(txt.parabola)
	{
		// Render parabola
		try {
			// Variables
			var	ptA=	board.select(txt.ellipse[0]);
			var	ptB=	board.select(txt.ellipse[1]);
			var	ptC=	board.select(txt.ellipse[2]);
			
			removeFromGraph(entry);
			if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
			{
				entry[0].graphRef=	board.create("parabola", [ptA, ptB],// ptC],
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
				});
			}
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	if(txt.hyperbola)
	{
		// Render hyperbola
		try {
			// Variables
			var	ptA=	board.select(txt.hyperbola[0]);
			var	ptB=	board.select(txt.hyperbola[1]);
			var	ptC=	board.select(txt.hyperbola[2]);
			
			removeFromGraph(entry);
			if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
			{
				entry[0].graphRef=	board.create("hyperbola", [ptA, ptB, ptC],
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
				});
			}
		}
		catch(e) { console.log("caught "+e); }
		
		return;
	}
	
	// Not too sure if the check should still be here
	try {
		
		// javascript math conversion here using  mathjs.js 
		eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");
		if (JXG.isFunction(userFunction)) {
			removeFromGraph(entry);
			if(isNaN(MathQuill(entry.find(".math-field")[0]).text()))
			{
				entry[0].graphRef = board.create("functiongraph", userFunction,
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css('color'),
					fixed:	isNaN(MathQuill(entry.find(".math-field")[0]).text())
				});
			}
			else
			{
				entry[0].graphRef=	board.create("line", [-1*parseInt(MathQuill(entry.find(".math-field")[0]).text()), 0, 1],
				{
					visible: true,
					strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
					strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
					fixed: false  //can make this true for VLT
				}).on("drag", function(e)
				{
					// Variables
					var	ly=	this.Y(0.5).toFixed(2);
					
					if(ly== "-0.00")
						ly="0.00"
					
					MathQuill(entry.find(".math-field")[0]).latex("").typedText(ly);
				});
			}
			entry[0].graphRef.setAttribute({dash: attr.dash}); // Dashed attribute just didn't want to go into the board options
		}
	}
	catch (e) { console.log("caught " + e); }
	reRenderLines();
}

// Called when the remove button has been called
function onRemoveClick(e)
{
	removeEntry($(e.target).parents(".entry"));
}

// Removes the given entry from the whole shabang
function removeEntry(entry)
{
    removeFromGraph(entry);  // remove from board
    // https://api.jquery.com/remove/  // reference to it remains??
	entry.remove();  // remove from DOM
}
// Removes the given object from the board
function removeFromGraph(entry) {
    if (typeof entry === "object") {
        board.removeObject(entry[0].graphRef);
    }
}

// Called whenever the user changes the color of the equation
function onShowColorClick(e)
{
    // Variables
    var thisCol = nextColor();
    var currEntry = $(this).parents(".entry");
    currEntry.find(".showColor").css({ 'color': thisCol });
	
	if (currEntry[0].graphRef)
	    (currEntry[0].graphRef).setAttribute({ strokeColor: thisCol });
	    if (JXG.isPoint(currEntry[0].graphRef))
	        (currEntry[0].graphRef).setAttribute({ fillColor: thisCol });
	    
    try {
        // get reference to children
        var d = (currEntry[0].graphRef).childElements;
		
        for (el in d) {
            //console.log(d[el]); // Got them - the freakin kids (2 hours for this)!!!!!
            d[el].setAttribute({strokeColor: thisCol });
            if(JXG.isPoint(d[el]))
                d[el].setAttribute({ fillColor: thisCol });
        }
	} catch (e) {
        // sometimes there are not any gliders and length is undefined.
	    //console.log(e);
	}
	
	board.update();

}

// Gets the next color in the array of stored colors
function nextColor() {   //n is a global variable used for the revolving color idea
    n = (n === colors.length-1) ? 0 : n + 1;
    return colors[n];
}

// Called whenever the drawer button is clicked
function onDrawerClick(e) {
    var currEntry = $(this).parents(".entry");
    currEntry.find(".collapse.basic").collapse("toggle");
}
function onDrawer2Click(e) {
    var currEntry = $(this).parents(".entry");
    currEntry.find(".collapse.calc").collapse("toggle");
}
function onThicknessPlusClick(e) {
    var currEntry = $(this).parents(".entry");
    if(currEntry[0].graphRef)
    {
        var n = parseInt((currEntry[0].graphRef).getAttribute('strokeWidth'));
        n = (n > 10) ? n : n + 1;
        // JSXgraph setProperty has been depreciated.
        (currEntry[0].graphRef).setAttribute({strokeWidth: n});
    }
};
function onThicknessMinusClick(e) {
    var currEntry = $(this).parents(".entry");
    if (currEntry[0].graphRef) {
        var n = parseInt((currEntry[0].graphRef).getAttribute('strokeWidth'));
        n = (n > 1) ? n-1 : 1;
        // JSXgraph setProperty has been depreciated...TODO replace everywhere
        (currEntry[0].graphRef).setAttribute({ strokeWidth: n });
    }
};
// enable entry dragging.  TODO: make touch friendly
function makeDraggable(e) {
    $(this).parents(".entry").draggable({ disabled: false });
}
function makeUnDraggable(e) {
    $(this).parents(".entry").draggable({ disabled: true });
}

// Called whenever the user wants to toggle between a dashed equation
function onDashedClick(e)
{
	// Variables
	var	currEntry=	$(this).parents(".entry");
	
	if(currEntry[0].graphRef)
	{
		if(currEntry[0].graphRef.getAttribute("dash"))
		{
			(currEntry[0].graphRef).setAttribute({dash: 0});
			currEntry[0].dashed=	false;
			currEntry.find(".dashed").css({color: "LightGray"});
		}
		else
		{
			(currEntry[0].graphRef).setAttribute({dash: 2});
			currEntry[0].dashed=	true;
			currEntry.find(".dashed").css({color: "Black"});
		}
	}
	else
		currEntry.effect("shake", {times: 2}, 700);
}

// Called when the map button is clicked
function onMapClick(e)
{
	// Variables
    var currEntry = $(this).parents(".entry");
    var currColor = currEntry.find(".showColor").css('color');
	
	if (currEntry[0].graphRef) {
	    board.create("glider", [0, 1, currEntry[0].graphRef], { color: currColor }).on('up', function (e) {
	        // map point on down stuff here
            // TODO: add touch capabilties
	        //console.log(e.which);
	        if (e.which === 3)
	            try{
	                board.removeObject(this);
	            } catch (err) {
	                //console.log(err);
	            }
	        
	    });
	} else
	    currEntry.effect("shake", { times: 2 }, 700);  // not sure this adds value
	reRenderLines();
}

// Called whenever the user clicks on the textbox
function onMathInputClick(e)
{
	var	currEntry=	$(e.target).parents(".entry");
	MathQuill.MathField(currEntry.find('.math-field')[0]).focus();
}

// Called whenever the collapse entry button has been clicked
function onCollapseEntryClick(e)
{
    var currEntry = $(e.target).parents(".entry");
    
    if (currEntry[0].oldLeft) {
        //slide back out right
        currEntry.animate({ left: currEntry[0].oldLeft }, "fast");
        currEntry.find(".collapse-entry .glyphicon").removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left");
		currEntry[0].oldLeft = 0;
        //slide back should be constrained to the window.
        //focus on mathinput
		MathQuill.MathField(currEntry.find('.math-field')[0]).focus();
    } else {
        // slide away left 
		if(currEntry.position().left> 0)
			currEntry[0].oldLeft = currEntry.position().left;
		else
		    currEntry[0].oldLeft = 1;
		currEntry.find(".collapse-entry .glyphicon").removeClass("glyphicon-menu-left").addClass("glyphicon-menu-right");
        currEntry.animate({ left: "-340px" }, "fast");
		
        //-340px should be dependent on the size of Entry really
    }
}

// Removes all the entries on the screen
function clearAll() {
	$(".entry").each(function(index, elem)
	{
		removeEntry($(elem));
	});
}

// Collapses all the entries TODO: Make it uncollapse all when all are docked
function collapseAll() {
	$(".entry").each(function(index, elem)
	{
		if(!elem.oldLeft)
			onCollapseEntryClick({target: $(elem).find(".collapse-entry")[0]});
	});
}

// Calculus
function onRootsClick(e) {
    var currEntry = $(e.target).parents(".entry");
    var interval = new Array(-10,-5);
    
    if (currEntry[0].graphRef) {

        // Do not know how to get the function from graphRef... should be able to  TODO: find out??
        // so redo it from mathquill
        var userFunction;
        var txt = MathQuill($(e.target).parents(".entry").find(".math-field")[0]).text();
		
		txt=	filterText(txt, $(e.target).parents(".entry"), 0);

        // javascript math conversion here using  mathjs.js 
        eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");

        if (JXG.isFunction(userFunction)) {
            // create and then add it as a child to the graph
            //console.log(JXG.Math.Numerics.fzero(userFunction, -10));
            // Still Working on it!
            console.log(userFunction(0));
			
			// Variables
			var	root=	JXG.Math.Numerics.root(userFunction,
				board.getBoundingBox()[0]+((board.getBoundingBox()[2]-board.getBoundingBox()[0])/2) // Gets the middle of the screen
			);
			
			// So here is a general root finder, it doesn't work well, but we could probably look it up or do the intermediate-value theorem
			
			if(!isNaN(root) && userFunction(root)== 0)
				board.create("point", [root, 0]);
        }
    }
}

function onTangentLineClick(e) {
    // Variables
    var currEntry = $(e.target).parents(".entry");

    if (currEntry[0].isTangentDisplayed) {
        board.removeObject(currEntry[0].isTangentDisplayed);
        currEntry[0].isTangentDisplayed = null;
    } else {
        if (currEntry[0].graphRef) {
            var szeFn = function () {
                var n = currEntry[0].graphRef.getAttribute('strokeWidth');
                return (n > 1) ? n - 1 : 1;
            };
            var graphColor = currEntry[0].graphRef.getAttribute('strokeColor');

            var d1 = parseFloat(currEntry.find('.numA').val());
            if(isNaN(d1)){d1=1.0}
            
            // p1 will be the closest point on the graph to (d1,0)
            var p1 = board.create("glider", [d1, 0, currEntry[0].graphRef], { strokeColor: graphColor, fillColor: graphColor, name: '' });
            currEntry[0].isTangentDisplayed = p1;

            //do not what to add tangent as a child of graph becase the color will change (Gray is better for tangent line.)
            board.create('tangent', [p1], { strokeColor: '#888888', strokeWidth: szeFn });
        }
    }




};

function onDerivativeClick(e) {
	// Variables
    var currEntry = $(e.target).parents(".entry");

    if (currEntry[0].isDerivDisplayed) {
        board.removeObject(currEntry[0].isDerivDisplayed);
        currEntry[0].isDerivDisplayed = null;
    } else {
        if (currEntry[0].graphRef) {
            var szeFn = function () {
                var n = currEntry[0].graphRef.getAttribute('strokeWidth');
                return (n > 1) ? n - 1 : 1;
            };
            var graphColor = currEntry[0].graphRef.getAttribute('strokeColor');

            // Do not know how to get the function from graphRef... should be able to  TODO: find out??
            // so redo it from mathquill
            var userFunction;
            var txt = MathQuill($(e.target).parents(".entry").find(".math-field")[0]).text();
			
			txt=	filterText(txt, $(e.target).parents(".entry"), 0);

            // javascript math conversion here using  mathjs.js 
            eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");
            if (JXG.isFunction(userFunction)) {
                // create and then add it as a child to the graph (it's color should change??
                currEntry[0].isDerivDisplayed = board.create('functiongraph', [JXG.Math.Numerics.D(userFunction)], { strokeColor: graphColor, strokeWidth: szeFn, dash: 2 });
                currEntry[0].graphRef.addChild(currEntry[0].isDerivDisplayed);
            }
        }
    }
	

};

function onIntegralClick(e)
{
	// Variables
	var	currEntry=	$(e.target).parents(".entry");
	
	if(currEntry[0].isIntegralDisplayed)
	{
	    board.removeObject(currEntry[0].isIntegralDisplayed.curveLeft);
	    board.removeObject(currEntry[0].isIntegralDisplayed.curveRight);
	    board.removeObject(currEntry[0].isIntegralDisplayed);
		currEntry[0].isIntegralDisplayed=	null;
	}
	else
	{
		if(currEntry[0].graphRef)
		{
		    var d1 = parseFloat(currEntry.find('.numA').val());
		    if (isNaN(d1)) { d1 = 1.0 }
		    var d2 = parseFloat(currEntry.find('.numB').val());
		    if (isNaN(d2)) { d2 = 2.0 }
		    currEntry[0].isIntegralDisplayed = board.create("integral", [[d1, d2], currEntry[0].graphRef], { color: 'purple', fillOpacity: 0.2 });
			//currEntry[0].graphRef.addChild(currEntry[0].isIntegralDisplayed);
		}
	}
}

// Riemann Sum *************************
function onEndpointTypeClick(e) {
    var currEntry = $(e.target).parents(".entry");
    currEntry.find('.menuTxt').html($(this).text());
    //TODO: if rSum is graphed need to regraph it.
    if (currEntry[0].isRsumDisplayed) {
        board.removeObject(currEntry[0].isRsumDisplayed);
        currEntry[0].isRsumDisplayed = null;
        graphRS(currEntry);
    }
}
function onSliderInput(e) {
    var currEntry = $(e.target).parents(".entry");
    currEntry.find('.nDisplay').html($(this).val());
    //TODO: if rSum is graphed need to regraph it.
    if (currEntry[0].isRsumDisplayed) {
        board.removeObject(currEntry[0].isRsumDisplayed);
        currEntry[0].isRsumDisplayed = null;
        graphRS(currEntry);
    }
}
function onRsumClick(e) {
    var currEntry = $(e.target).parents(".entry");

    if (currEntry[0].isRsumDisplayed) {
        board.removeObject(currEntry[0].isRsumDisplayed);
        currEntry.find(".RSresult").html("");
        currEntry[0].isRsumDisplayed = null;
    }
    else {
        if (currEntry[0].graphRef) {
            graphRS(currEntry);
        }
    }
}

function graphRS(currEntry) {
    
    var d1 = parseFloat(currEntry.find('.numA').val());
    if (isNaN(d1)) { d1 = 1.0 }
    var d2 = parseFloat(currEntry.find('.numB').val());
    if (isNaN(d2)) { d2 = 2.0 }
    var n = parseInt(currEntry.find(".nDisplay").html());
    var t = currEntry.find(".menuTxt").html();
    
    // Do not know how to get the function from graphRef... should be able to  TODO: find out??
    // so redo it from mathquill
    var userFunction;
    var txt = MathQuill(currEntry.find(".math-field")[0]).text();

    txt = filterText(txt, currEntry, 0);
    // javascript math conversion here using  mathjs.js 
    eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");
    currEntry[0].isRsumDisplayed = board.create('riemannsum', [userFunction, n, t, d1, d2], { color: 'orange', fillOpacity: 0.2 });

    currEntry[0].graphRef.addChild(currEntry[0].isRsumDisplayed)
    currEntry.find(".RSresult").html("&sum; = " + JXG.Math.Numerics.riemannsum(userFunction, n, t, d1, d2).toFixed(4));


};

//*************************

// Called when the entry has gained focus somehow TODO: Continue working on the focusing entries
function onEntryFocus(e)
{
	$(e.target).parents(".entry").css("z-index", 11);
}

// Called when the entry has lost focus somehow
function onEntryBlur(e)
{
	$(e.target).parents(".entry").css("z-index", 10);
}

// End of File

/*
/// For reference

// Renders the graph
// Ruins of the old renderer, delete later, keep now for reference?
function old_renderGraph(inputObj) {
    // this function takes in an Entry, creates javascript math, and then associates a graph to the entry
    // Variables
    var userFunction;
    var txt = $(inputObj).find(".mathquill-editable").mathquill("text");
    txt = asciiMathfromMathQuill(txt).toLowerCase();

    // not sure where to do the following... also needs to be stramlined... (3,2) plot a point.
    if (txt.indexOf(",") !== -1) {
        // if there is a comma try to plot a point
        // try to render text ((3,2)) as an array [3,2] using the eval below
        // TODO: streamline this
        var modifiedTxt = eval(txt.replace("((", "[").replace("))", "]"));
        try {
            if (JXG.isArray(modifiedTxt)) {
                removeFromGraph(inputObj);
                inputObj.graphRef = board.create("point", modifiedTxt,
                {
                    visible: true,
                    strokeColor: inputObj.color,
                    fillColor: inputObj.color,
                    fixed: true
                });
            }

        } catch (e) {
            // console.log("with comma " + e);
        }

    } else if (txt.substring(0, 7) === "l*i*n*e") {
        //console.log(txt[8] + "," + txt[10]);

        try {
            var pt1 = board.select(txt[8].toUpperCase());
            var pt2 = board.select(txt[10].toUpperCase());

            if (JXG.isPoint(pt1) && JXG.isPoint(pt2)) {
                removeFromGraph(inputObj);
                inputObj.graphRef = board.create("line", [pt1, pt2],
                {
                    visible: true,
                    strokeWidth: 2,
                    strokeColor: inputObj.color
                });
            }
        }
        catch (e) { console.log("caught " + e); }


    } else {
        try {
            // javascript math conversion here using  mathjs.js 
            eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");
            if (JXG.isFunction(userFunction)) {
                removeFromGraph(inputObj);
                inputObj.graphRef = board.create("functiongraph", userFunction,
                {
                    visible: true,
                    strokeWidth: 2,
                    strokeColor: inputObj.color
                });
            }
        }
        catch (e) { console.log("caught " + e); }
    }

}
*/