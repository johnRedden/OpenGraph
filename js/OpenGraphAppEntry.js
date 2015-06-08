

// Variables
var	colors=	['SlateGray', 'RoyalBlue', 'SeaGreen', 'Violet', 'Coral'];
var	n=	0;

// Called when the page is loaded up
$(document).ready(function()
{
	$(".entry")[0].graphRef;
	$(".entry")[0].color=	nextColor();
	$(".entry")[0].dashed=	false;
	$(".entry").draggable();
	$("#m-entry").graphRef;
	
	entryFocusMath($(".entry")[0]);
	displayColorToEntry($(".entry"));
	
	$(".myForm").on("click", ".btn-add", onAddClick
	).on("click", ".btn-remove", onRemoveClick
	).on("click", ".map", onMapClick
	).on("click", ".showColor", onShowColorClick
	).on("click", ".dashed", onDashedClick
	).on("click", ".mathinput", onMathInputClick
	).on("keyup", ".entry", onEntryKeyUp);
	
	$("#m-entry").on("keyup", "textarea", onMobileEntryKeyUp);
});

// Gets the next color in the array of stored colors
function nextColor()
{
	n++;
	if(n=== colors.length)
		n=	0;
	
	return colors[n];
}

// Displays the color to the entry loader thingy mabober... NOTE: What is the official name to that thing?
function displayColorToEntry(entry)
{
	entry.find(".showColor").css({backgroundColor: entry[0].color});
}
	
// Focuses on mathquill's textarea
function entryFocusMath(inputEntry)
{
	$(inputEntry).find(".mathquill-editable:first").addClass('hasCursor').focus();
	$(inputEntry).find(".mathquill-editable:first").find('textarea').focus();
}

// Removes the given object from the graph
function removeFromGraph(inputObj)
{
	if(typeof inputObj=== "object")
	{
		board.removeObject(inputObj.graphRef);
	}
}

// Renders the graph
function renderGraph(inputObj)
{
	// Variables
	var	userFunction;
	var	txt=	$(inputObj).find(".mathquill-editable").mathquill("text");
	var	convertedMath;
	
	txt=	fixInput(txt, inputObj).toLowerCase();
	convertedMath=	mathjs(txt);
	
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
				strokeColor:	inputObj.color
			});
		}
	}
	catch(e)	{	console.log("caught "+e);	}
}

// Renders the graph for the mobile view
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

// Fixes up mathquill derp ups
function fixInput(txt, entry)
{
	// Variables
	var	n=	txt.length;
	
	txt.toLowerCase();
	
	if(n> 4)
	{
		// Variables
		var	last3=	txt.substring(n-5, n);
		
		switch(last3)
		{
			case "s*i*n":	case "c*o*s":	case "t*a*n":	case "q*r*t":
				$(entry).find(".mathquill-editable").mathquill("write", "\\left( x \\right)");
				entryFocusMath(entry);
				break;
		}
	}
	
	txt=	$(entry).find(".mathquill-editable").mathquill("text");
	txt=	txt.replace("**", "^");
	txt=	txt.replace("s*i*n*", "sin");
	txt=	txt.replace("c*o*s*", "cos");
	txt=	txt.replace("cosh*", "cosh");
	txt=	txt.replace("t*a*n*", "tan");
	txt=	txt.replace("tan*h", "tanh");
	txt=	txt.replace("s*q*r*t", "sqrt");
	txt=	txt.replace("p*i", "pi");
	txt=	txt.replace("xcdot", "");
	
	return txt;
}

// Called when the add button has been clicked
function onAddClick(e)
{
	// Variables
	var controlForm=	$(".myForm");
	var	currentEntry=	$(this).parents(".entry");
	var	newEntry= 	$(currentEntry.clone()).appendTo(controlForm);
	
	newEntry[0].color= nextColor();
	newEntry.find('.mathquill-editable').html("&nbsp;").mathquill('editable');//TODO give focus
	displayColorToEntry(newEntry);//newEntry.find('.showColor').css({ backgroundColor: newEntry[0].color });
	newEntry.find('.dashed').css({ color: colors[0] });
	newEntry.draggable();
	
	// change the button faces
	controlForm.find('.entry:not(:last) .btn-add'
	).removeClass('btn-add').addClass('btn-remove'
	).html('<span class="glyphicon glyphicon-minus"></span>');
}

// Called when the remove button has been called
function onRemoveClick(e)
{
	// Variables
	var	currEntry=	$(this).parents(".entry");
	
	removeFromGraph(currEntry[0]);
	currEntry.remove();
}

// Called whenever the user changes the color of the equation
function onShowColorClick(e)
{
	// Variables
	var	currEntry=	$(this).parents(".entry");
	
	currEntry[0].color=	nextColor();
	if(currEntry[0].graphRef)
		(currEntry[0].graphRef).setProperty({strokeColor: currEntry[0].color});
	displayColorToEntry(currEntry);
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
			currEntry.find(".dashed").css({color: colors[0]});
		}
		else
		{
			(currEntry[0].graphRef).setProperty({dash: 2});
			currEntry[0].dashed=	true;
			currEntry.find(".dashed").css({color: "red"});
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
	
	if(currEntry[0].graphRef)
		board.create("glider", [0, 0, currEntry[0].graphRef], {color: currEntry[0].color});
	else
		currEntry.effect("shake", {times: 2}, 700);
}

// Called whenever the user clicks on the textbox
function onMathInputClick(e)
{
	// Variables
	var	currEntry=	$(e.target).parents(".entry")[0];
	
	entryFocusMath(currEntry);
}

// Called whenever there is a key detected on an entry input
function onEntryKeyUp(e)
{
	// Variables
	var	currEntry=	$(e.target).parents(".entry")[0];
	
	if(e.keyCode=== 13)
		$(currEntry).find(".btn-add").trigger("click");
	
	renderGraph(currEntry);
	
	if(currEntry.dashed)
	{
		$(currEntry).find(".dashed").trigger("click");
		$(currEntry).find(".dashed").trigger("click");
	}
}

// Called whenever there is a key detected on the mobile entry input
function onMobileEntryKeyUp(e)
{
	// Variables
	var	currEntry=	$(e.target).parents("#m-entry")[0];
	
	renderGraphMobile(currEntry);
}

// End of File