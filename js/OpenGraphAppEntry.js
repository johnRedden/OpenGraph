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
    newEntry[0].dashed = false;  // can use getAttribute instead of this.. TODO: eliminate this variable
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

    if (currEntry.dashed) { // we can streamline using JSXGraph getAttribute 'dashed'
        $(currEntry).find(".dashed").click().click();
    }
}
// special cases
function catchEntryText(entry, key) {
	
	// Variables
	var	txt=	MathQuill(entry.find(".math-field")[0]).text();
	var	bGraph=	false;
	
	try
	{
		// Gets hyperbolic functions by default
		txt = txt.toLowerCase()
				.replace(/\*\*\*/g, "^")
				.replace(/cdot\s/g, "*")
				.replace(/\\s\*i\*n[\s]*[\*]?/g, "sin")
				.replace(/\\c\*s\*c[\s]*[\*]?/g, "csc")
				.replace(/\\c\*o\*s[\s]*[\*]?/g, "cos")
				.replace(/\\s\*e\*c[\s]*[\*]?/g, "sec")
				.replace(/\\t\*a\*n[\s]*[\*]?/g, "tan")
				.replace(/\\c\*o\*t[\s]*[\*]?/g, "cot")
				.replace(/\s\*/g, ""); // Had to take this out, messed things up
		
		// In order for the hyperbolic functions to be compatible and easy to use, I had to detect the h key before
		// Although this system isn't perfect, it works nicely. And the trig functions are unable to be caught if behind parenthesis
		// or fractions or things of the sort
		if((key== 104 || key== 72) && txt.length>= 6) // Looks for 'h' or 'H'
		{
			switch(txt.substring(txt.length-7))
			{ // If any of the given snippets have h in them, then transform them into the hyperbolic form
				case "sin(h)":
				//case "csc(h)": // Gets weird results
				case "cos(h)":
				//case "sec(h)": // Gets weird results
				case "tan(h)":
				case "cot(h)":
					MathQuill(entry.find(".math-field")[0]).latex(""); // Deletes everything on the entry
					txt=	txt.substring(0, txt.length-3)+"h("; // Formulates everything to make it hyperbolic
					MathQuill(entry.find(".math-field")[0]).typedText(txt); // Rewrites everything back on
					break;
			}
		}
		else if(txt.length>= 3 && key!= 8 && key!= 127) // Else if they are not pressing backspace or delete, so there is no fighting
		{
			switch(txt.substring(txt.length-3))
			{
				case "sin":
				case "csc":
				case "cos":
				case "sec":
				case "tan":
				case "cot":
					MathQuill(entry.find(".math-field")[0]).typedText("("); // Acts as if the user typed in a parenthesis instead
					break;
			}
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
		
		// JOHN >> I know you want to use the console.log() method, but I put this here so you are able to have a live demonstration
		// of what is going on with the text in the entry
		$("#header").text("ENTRY Text: "+txt);
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

// Renders the graph
function renderGraph(entry, txt)
{
	// Variables
    var userFunction;
	
	// Not too sure if the check should still be here
	try {
		// javascript math conversion here using  mathjs.js 
		eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");
		if (JXG.isFunction(userFunction)) {
			removeFromGraph(entry);
			entry[0].graphRef = board.create("functiongraph", userFunction,
			{
				visible: true,
				strokeWidth: 2,
				strokeColor: entry.find(".showColor").css('color')
			});
		}
	}
	catch (e) { console.log("caught " + e); }
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
    n = (n === colors.length) ? 0 : n + 1;
    return colors[n];
}

// Called whenever the drawer button is clicked
function onDrawerClick(e) {
    var currEntry = $(this).parents(".entry");
    currEntry.find(".collapse").collapse("toggle");
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
		if(currEntry[0].dashed)
		{
			(currEntry[0].graphRef).setProperty({dash: 0});
			currEntry[0].dashed=	false;
			currEntry.find(".dashed").css({color: "LightGray"});
		}
		else
		{
			(currEntry[0].graphRef).setProperty({dash: 2});
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
	    board.create("glider", [0, 1, currEntry[0].graphRef], { color: currColor });
	} else
	    currEntry.effect("shake", { times: 2 }, 700);  // not sure this adds value
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
		if(currEntry.offset().left> 0)
			currEntry[0].oldLeft = currEntry.offset().left;
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

// Calculus
function onRootsClick(e) {
    var currEntry = $(e.target).parents(".entry");
    var interval = new Array(-10,-5);
    
    if (currEntry[0].graphRef) {

        // Do not know how to get the function from graphRef... should be able to  TODO: find out??
        // so redo it from mathquill
        var userFunction;
        var txt = MathQuill($(e.target).parents(".entry").find(".mathquill-editable")[0]).text();
        txt = asciiMathfromMathQuill(txt).toLowerCase();

        // javascript math conversion here using  mathjs.js 
        eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");

        if (JXG.isFunction(userFunction)) {
            // create and then add it as a child to the graph
            //console.log(JXG.Math.Numerics.fzero(userFunction, -10));
            // Still Working on it!
            // I think I should use intersection but not sure
            
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

            var p1 = board.create("glider", [1, 0, currEntry[0].graphRef], { strokeColor: graphColor, fillColor: graphColor, name: '' });
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
            txt = asciiMathfromMathQuill(txt).toLowerCase();

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