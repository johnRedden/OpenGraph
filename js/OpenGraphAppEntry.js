/// <reference path="bootstrap.js" />

// Variables
var	colors=	['SlateGray', 'RoyalBlue', 'SeaGreen', 'Violet', 'Coral'];
var	n=	0;
var	blankEntry,template;

// Called whenever there is a key detected on an entry input
function onEntryKeyUp(e) {
  
    // Variables
    var currEntry = $(e.target).parents(".entry")[0];

    if (e.keyCode === 13) {
        onNewEntryClick(e);
    }else{
        // catch special cases here before trying to render graph.
       // keyUpSpecialCases(currEntry, e.keyCode);  //can change currEntry
        renderGraph(currEntry);  //does not change currEntry
    }

    if (currEntry.dashed) { // we can streamline using JSXGraph getAttribute 'dashed'
        $(currEntry).find(".dashed").click().click();
    }
}
// special cases
// Don't know if we really need this or not anymore
function keyUpSpecialCases(inputObj, key) {
    //this is helpful: (  https://github.com/Khan/mathquill)
    console.log(MathQuill($(inputObj).find(".math-field")[0]).latex());
    console.log(MathQuill($(inputObj).find(".math-field")[0]).text());

}

// Renders the graph
function renderGraph(entry)
{
	// Variables
	var	userFunction;
	var	mqtxt=	MathQuill($(entry).find(".math-field")[0]).text();
	
	// JOHN>> Looks like it is a little neccessary to change things up a bit for the render function, but good news
	// there isn't much to really change now! The new MathQuill takes care of a lot really. Just need some fixes for
    // sin, cos, and tan, and anything else that I cannot really think of at the moment
    // PAUL>> I really think we can do this in the special cases function or somewhere else...  renderGraph should just do that if it can... otherwise throw an error message
	mqtxt=	mqtxt.replace(/\*\*\*/g, "^").replace(/cdot\s/g, "*").replace(
		/\\s\*i\*n\s\*/g, "sin").replace(/\\c\*o\*s\s\*/g, "cos").replace(
		/\\t\*a\*n\s\*/g, "tan");
	//$("#header").text(mqtxt); // use console.log
	
	try {
		// javascript math conversion here using  mathjs.js 
		eval("userFunction= function(x) { with(Math) return " + mathjs(mqtxt) + " }");
		if (JXG.isFunction(userFunction)) {
			removeFromGraph(entry);
			entry.graphRef = board.create("functiongraph", userFunction,
			{
				visible: true,
				strokeWidth: 2,
				strokeColor: entry.color
			});
		}
	}
	catch (e) { console.log("caught " + e); }
}

// Renders the graph
// Ruins of the old renderer, delete later, keep now for reference?
function old_renderGraph(inputObj)
{
    // this function takes in an Entry, creates javascript math, and then associates a graph to the entry
	// Variables
	var	userFunction;
	var txt = $(inputObj).find(".mathquill-editable").mathquill("text");
	txt = asciiMathfromMathQuill(txt).toLowerCase();
	
    // not sure where to do the following... also needs to be stramlined... (3,2) plot a point.
	if (txt.indexOf(",") !== -1 ){
	    // if there is a comma try to plot a point
	    // try to render text ((3,2)) as an array [3,2] using the eval below
        // TODO: streamline this
	    var modifiedTxt = eval( txt.replace("((", "[").replace("))", "]") );
	    try {
	        if(JXG.isArray(modifiedTxt)){
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

	} else if (txt.substring(0,7)==="l*i*n*e") {
	    //console.log(txt[8] + "," + txt[10]);

	    try {
	        var pt1 = board.select(txt[8].toUpperCase());
	        var pt2 = board.select(txt[10].toUpperCase());
	       
	        if (JXG.isPoint(pt1) && JXG.isPoint(pt2)) {
	            removeFromGraph(inputObj);
	            inputObj.graphRef = board.create("line", [pt1,pt2],
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
// Returns asciiMath from a MathQuill text string
// Delete??
function asciiMathfromMathQuill(txt) {
    // This function should take in an entry and return well formed asciiMath
    var n = txt.length;

    txt = txt.replace("***", "^");

    // I think all this below can go???
    txt = txt.replace("s*i*n*", "sin");
    txt = txt.replace("c*o*s*", "cos");
    txt = txt.replace("cosh*", "cosh");
    txt = txt.replace("t*a*n*", "tan");
    txt = txt.replace("tanh*", "tanh");
    //txt=	txt.replace("s*q*r", "\\(sqrt)&nbsp;");
    txt = txt.replace("p*i", "pi");
    txt = txt.replace("xcdot", "");
     
    // this needs to return good asciiMath!
    //console.log("asciiMath: " + txt);
    return txt;
}

// Creates a new entry, despite clicking on the entry
function onNewEntryClick(e)
{
	// Variables
	var	newEntry;
	var	lastEntry=	null;
	
	if($(".entry").length> 0)
		lastEntry=	$($(".entry")[$(".entry").length-1]);
	newEntry=	$(blankEntry.clone()).appendTo($(".myForm"));
	constructNewEntry(newEntry, lastEntry);
}

// Constructs the new entry
function constructNewEntry(newEntry, lastEntry)
{
	if(lastEntry!= null)
		newEntry.offset({top: lastEntry.offset().top+lastEntry.height()+36, left: lastEntry.offset().left});
	if(newEntry.offset().top+newEntry.height()> $(window).height())
	{
		// Variables
		var	offset=	newEntry.offset();
		
		newEntry.offset({top: 85, left: offset.left+64, right: offset.right, bottom: offset.bottom});
	}
	if(newEntry.offset().left< 0)
	{
		newEntry.offset({left: 1});
		//newEntry.find(".collapse-entry").find(".glyphicon").removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left");
	}
	newEntry[0].color= nextColor();
	MathQuill(newEntry.find('.math-field')[0]).latex("");
	displayColorToEntry(newEntry);
	newEntry.find('.dashed').css({ color: "LightGray" });
	newEntry.draggable({ disabled: true, containment:'document' });  // TODO: change to mobile friendly
	MathQuill(newEntry.find(".math-field")[0]).focus(); // use the focus method
	
	return newEntry;
}

// Called when the remove button has been called
function onRemoveClick(e)
{
	removeEntry($(e.target).parents(".entry"));
}

// Removes the given entry from the whole shabang
function removeEntry(entry)
{
	removeFromGraph(entry[0]);
	entry.remove();
}

// Called whenever the user changes the color of the equation
function onShowColorClick(e)
{
	// Variables
	var	currEntry=	$(this).parents(".entry");
	
	currEntry[0].color=	nextColor();
	if (currEntry[0].graphRef)
	    (currEntry[0].graphRef).setAttribute({ strokeColor: currEntry[0].color });
	    if (JXG.isPoint(currEntry[0].graphRef))
	        (currEntry[0].graphRef).setAttribute({ fillColor: currEntry[0].color });
	    
    try {
        // get reference to child map points
        var d = (currEntry[0].graphRef).childElements;
		
        for (el in d) {
            //console.log(d[el]); // Got them - the freakin kids (2 hours for this)!!!!!
            d[el].setAttribute({ fillColor: currEntry[0].color, strokeColor: currEntry[0].color });
        }
	} catch (e) {
        // sometimes there are not any gliders and length is undefined.
	    //console.log(e);
	}
	
	board.update();

	displayColorToEntry(currEntry);
}
// Gets the next color in the array of stored colors
function nextColor() {   //n is a global variable used for the revolving color idea
    n = (n === colors.length) ? 0 : n + 1;
    return colors[n];
}

// Displays the color to the entry's function
// John Says - huh - you mean the color indicator ?
// Paul Responds - I meant the entry, but I guess we stuck with the name ENTRY
function displayColorToEntry(entry) {
    entry.find(".showColor").css({ 'color': entry[0].color });
}

// Focuses on mathquill's textarea
function entryFocusMath(entry) {
    var blankEntry = $(".entry").find(".math-field")[0];
    MathQuill(blankEntry).focus();
}

// Removes the given object from the graph
function removeFromGraph(entry) {
    if (typeof entry === "object") {
        board.removeObject(entry.graphRef);
    }
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
        // JSXgraph setProperty has been depreciated...TODO replace everywhere
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
// enable entry dragging.
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
	var	currEntry=	$(this).parents(".entry");
	
	if (currEntry[0].graphRef) {
	    board.create("glider", [0, 0, currEntry[0].graphRef], { color: currEntry[0].color });
	    //console.log(currEntry[0].graphRef.countChildren() + "hmm" + currEntry[0].graphRef.descendants);
	    //currEntry[0].gliderRefs.push(board.create("glider", [0, 0, currEntry[0].graphRef], {color: currEntry[0].color}));
	} else
	    currEntry.effect("shake", { times: 2 }, 700);  // not sure this adds value
}

// Called whenever the user clicks on the textbox
function onMathInputClick(e)
{
	// Variables
	var	currEntry=	$(e.target).parents(".entry")[0];
	
	entryFocusMath(currEntry);
}

// Called whenever the collapse entry button has been clicked
function onCollapseEntryClick(e)
{
    var currEntry = $(e.target).parents(".entry")[0];
    
    if (currEntry.oldLeft) {
        $(currEntry).animate({ left: currEntry.oldLeft }, "fast");
		$(e.target).find(".glyphicon").removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left"); // Somethings wrong with the changes for some reason
        currEntry.oldLeft = 0;
        //slide back should be constrained to the window.
    } else {
        console.log($(currEntry).offset().left);
		if($(currEntry).offset().left> 0)
			currEntry.oldLeft = $(currEntry).offset().left;
		else
			currEntry.oldLeft=	1;
        $(currEntry).animate({ left: "-340px" }, "fast");
		$(e.target).find(".glyphicon").removeClass("glyphicon-menu-left").addClass("glyphicon-menu-right");
        //-340px should be dependent on the size of Entry really
        //TODO change the glyphicon to right
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
    if (currEntry[0].graphRef) {
		// Variables
        var szeFn = function () { return currEntry[0].graphRef.getAttribute('strokeWidth') - 1 };
        var graphColor =  currEntry[0].graphRef.getAttribute('strokeColor');
        var p1 = board.create("glider", [1, 1, currEntry[0].graphRef], { strokeColor: graphColor, fillColor: graphColor, name: '' });
		
        //do not what to add tangent as a child of graph becase the color will change (Gray is better for tangent line.)
        board.create('tangent', [p1], { strokeColor: '#888888', strokeWidth: szeFn }) ;
    }

};

function onDerivativeClick(e) {
	// Variables
    var currEntry = $(e.target).parents(".entry");
	
    if (currEntry[0].graphRef) {
		// Variables
        var n = currEntry[0].graphRef.getAttribute('strokeWidth');

        // Do not know how to get the function from graphRef... should be able to  TODO: find out??
        // so redo it from mathquill
        var userFunction;
        var txt = MathQuill($(e.target).parents(".entry").find(".math-field")[0]).text();
        txt = asciiMathfromMathQuill(txt).toLowerCase();

        // javascript math conversion here using  mathjs.js 
        eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");
        if (JXG.isFunction(userFunction)) {
           // create and then add it as a child to the graph
            currEntry[0].graphRef.addChild(board.create('functiongraph', [JXG.Math.Numerics.D(userFunction)], { strokeColor: '#888888', strokeWidth: n - 1 }));
        }

    }

};
// End of File