/// <reference path="bootstrap.js" />

// Variables
var	colors=	['SlateGray', 'RoyalBlue', 'SeaGreen', 'Violet', 'Coral'];
var	n=	0;
var	blankEntry;

// Called when the page is loaded up
$(document).ready(function()
{
    $(".entry")[0].graphRef;
    // I believe map point gliders are children of graphRef
	//$(".entry")[0].gliderRefs=	new Array();
	$(".entry")[0].color=	nextColor();
	$(".entry")[0].dashed=	false;  // can use getAttribute instead of this
	$(".entry").draggable({ disabled: true, containment:'document' }); // only want to drag in grabber.
	blankEntry=	$(".entry");
	$("#m-entry").graphRef; // not sure what this is for??
	
	entryFocusMath($(".entry")[0]);
	displayColorToEntry($(".entry"));
	
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
    ).on("click", ".thicknessMinus", onThicknessMinusClick);


	$("#addNewEntry").on("click", onNewEntryClick);
	
	$("#m-entry").on("keyup", "textarea", onMobileEntryKeyUp);  // redesign?? tow onkeyups will be cumbersome
});


// Called whenever there is a key detected on an entry input
function onEntryKeyUp(e) {
  
    // Variables
    var currEntry = $(e.target).parents(".entry")[0];

    if (e.keyCode === 13) {
        onNewEntryClick(e);
    }else{
        // catch special cases here before trying to render graph.
        keyUpSpecialCases(currEntry, e.keyCode);  //can change currEntry
        renderGraph(currEntry);  //does not change currEntry
    }

    if (currEntry.dashed) { // we can streamline using JSXGraph getAttribute 'dashed'
        $(currEntry).find(".dashed").click().click();
    }
}
// special cases
function keyUpSpecialCases(inputObj, key) {
    //this is helpful: (  http://pythonhackers.com/p/Khan/mathquill  )
    var mathquillText = $(inputObj).find(".mathquill-editable").mathquill('text');
    var mathquillLatex = $(inputObj).find(".mathquill-editable").mathquill('latex');
    var m = mathquillLatex.length;
    //console.log(key);
    //console.log("text1: " + mathquillText);

    /*  this works but there has to be a better way!!!
    if (mathquillLatex.substring(m - 2, m) === "sq") {
        $(inputObj).find(".mathquill-editable").mathquill('latex', mathquillLatex.substring(0, m - 2));
        $(inputObj).find(".mathquill-editable").mathquill('cmd', '\\sqrt');
        entryFocusMath(inputObj);
    }
    */
    //Todo: catch the case where sq is in a fraction and looks like {sq} 

    //console.log("text2: " + $(inputObj).find(".mathquill-editable").mathquill('text'));
    //console.log("latex: " + $(inputObj).find(".mathquill-editable").mathquill('latex'));

}
// Renders the graph
function renderGraph(inputObj)
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
function asciiMathfromMathQuill(txt) {
    // This function should take in an entry and return well formed asciiMath
    var n = txt.length;

    txt = txt.replace("**", "^");

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

// Renders the graph for the mobile view
// Mobile should use the same rendering function, why does it need to be different??
function renderGraphMobile(inputObj)
{
	// Variables
	var	userFunction;
	var	txt=	$(inputObj).find("textarea").val().toLowerCase();
	var	convertedMath=	mathjs(txt);
	
	try
	{
		eval("userFunction= function(x) { with(Math) return "+convertedMath+" }");
		if(JXG.isFunction(userFunction))
		{
			removeFromGraph(inputObj);
			inputObj.graphRef=	board.create("functiongraph", userFunction,
			{
				visible:	true,
				strokeWidth:	2,
				strokeColor:	"blue"
			});
		}
	}
	catch(e)	{	console.log("caught "+e);	}
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
	newEntry.find('.mathquill-editable').html("&nbsp;").mathquill('editable');
	displayColorToEntry(newEntry);
	newEntry.find('.dashed').css({ color: "LightGray" });
	newEntry.draggable({ disabled: true, containment:'document' });  // TODO: change to mobile friendly
	newEntry.find(".mathquill-editable:first").addClass('hasCursor').find('textarea').focus();
	
	return newEntry;
}

// Called when the remove button has been called
function onRemoveClick(e)
{
	// Variables
	var	currEntry=	$(this).parents(".entry");
	var	locations=	new Array();
	
	removeFromGraph(currEntry[0]);
	$(".entry").each(function(index, elem)
	{
		if(elem=== currEntry[0])
			return;
		
		locations.push($(elem).offset());
	});
	currEntry.remove();
	$(".entry").each(function(index, elem)
	{
		$(elem).offset(locations[index]);
	});
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
        // PAUL --> no need for extra array to hold child references  (Erase when you see this)
        //(currEntry[0].graphRef).removeDescendants();
        // NO... get all children of graph using graphRef
	    //for(var i= 0; i< currEntry[0].gliderRefs.length; i++)
	        //currEntry[0].gliderRefs[i].setProperty({color: currEntry[0].color});
	} catch (e) {
        // sometimes there are not any gliders and length is undefined.
	    //console.log(e);
	}

	displayColorToEntry(currEntry);
}
// Gets the next color in the array of stored colors
function nextColor() {   //n is a global variable used for the revolving color idea
    n = (n === colors.length) ? 0 : n + 1;
    return colors[n];
}

// Displays the color to the entry loader thingy mabober... NOTE: What is the official name to that thing?
// John Says - huh - you mean the color indicator ?
function displayColorToEntry(entry) {
    entry.find(".showColor").css({ 'color': entry[0].color });
}

// Focuses on mathquill's textarea
function entryFocusMath(inputEntry) {
    $(inputEntry).find(".mathquill-editable:first").addClass('hasCursor').focus();
    $(inputEntry).find(".mathquill-editable:first").find('textarea').focus();
}

// Removes the given object from the graph
function removeFromGraph(inputObj) {
    if (typeof inputObj === "object") {
        board.removeObject(inputObj.graphRef);
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



// Called whenever there is a key detected on the mobile entry input
// Streamline with one render graph function
function onMobileEntryKeyUp(e)
{
	// Variables
	var	currEntry=	$(e.target).parents("#m-entry")[0];
	
	renderGraphMobile(currEntry);
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

// End of File