/// <reference path="bootstrap.js" />

// Variables
var	colors=	['SlateGray', 'RoyalBlue', 'SeaGreen', 'Violet', 'Coral'];
var	n=	0;

// Called when the page is loaded up
$(document).ready(function()
{
	$(".entry")[0].graphRef;
	$(".entry")[0].gliderRefs=	new Array();
	$(".entry")[0].color=	nextColor();
	$(".entry")[0].dashed=	false;
	$(".entry").draggable({ disabled: true, containment:'document' }); // only want to drag in grabber.
	$("#m-entry").graphRef; // not sure what this is for??
	
	entryFocusMath($(".entry")[0]);
	displayColorToEntry($(".entry"));
	
	$(".myForm").on("click", ".btn-add", onAddClick
	).on("click", ".btn-remove", onRemoveClick
	).on("click", ".map", onMapClick
	).on("click", ".showColor", onShowColorClick
    ).on("mouseover", ".grabber", makeDraggable // TODO: make touch friendly
    ).on("mouseout", ".grabber", makeUnDraggable // TODO: make touch friendly
	).on("click", ".dashed", onDashedClick
	).on("click", ".mathinput", onMathInputClick
    ).on("click", ".drawer1", onDrawerClick
	).on("keyup", ".entry", onEntryKeyUp
	).on("click", ".collapse-entry", onCollapseEntryClick);
	$("#addNewEntry").on("click", onNewEntryClick);
	
	$("#m-entry").on("keyup", "textarea", onMobileEntryKeyUp);  // redesign?? tow onkeyups will be cumbersome
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
// John Says - huh - you mean the color indicator ?
function displayColorToEntry(entry)
{
    entry.find(".showColor").css({ 'background-color': entry[0].color });
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
	var txt = $(inputObj).find(".mathquill-editable").mathquill("text");
	txt = fixInput(txt, inputObj).toLowerCase();
	console.log(txt.substring(0, 7));
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
	        console.log("with comma " + e);
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
	txt = txt.replace("xcdot", "");

	
	
	return txt;
}

// Constrains the given entry to the given element
function constrainTo(entry, elem)
{
	if(entry.offset().left< 0)
		entry.offset({left: 0});
	if(entry.offset().left+entry.width()> $(elem).width())
		entry.offset({left: $(elem).width()-entry.width()});
	if(entry.offset().top< 0)
		entry.offset({top: 0});
	if(entry.offset().top+entry.height()> $(elem).height())
		entry.offset({top: $(elem).height()-entry.height()});
}

// Creates a new entry, despite clicking on the entry
function onNewEntryClick(e)
{
	// Variables
	var	newEntry;
	
	$(".entry").find(".btn-add").click();
	newEntry=	$($($(".entry").find(".btn-add")[0]).parents(".entry")[0]);
	constrainTo(newEntry, window);
}

// Called when the add button has been clicked
function onAddClick(e)
{
	// Variables
	var controlForm=	$(".myForm");
	var	currentEntry=	$(this).parents(".entry");
	var	newEntry= 	$(currentEntry.clone()).appendTo(controlForm);
	
	if(newEntry.offset().top+newEntry.height()> $(window).height())
	{
		// Variables
		var	offset=	newEntry.offset();
		
		newEntry.offset({top: 64, left: offset.left+64, right: offset.right, bottom: offset.bottom});
	}
	newEntry[0].color= nextColor();
	newEntry.find('.mathquill-editable').html("&nbsp;").mathquill('editable');
	displayColorToEntry(newEntry);
	newEntry.find('.dashed').css({ color: "LightGray" });
	newEntry.draggable({ disabled: true });  // TODO: change to mobile friendly
	newEntry.find(".mathquill-editable:first").addClass('hasCursor').find('textarea').focus();
	
	
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
	    (currEntry[0].graphRef).setProperty({ strokeColor: currEntry[0].color });
	    if (JXG.isPoint(currEntry[0].graphRef))
	        (currEntry[0].graphRef).setProperty({ fillColor: currEntry[0].color });
	    
	try{
	    for(var i= 0; i< currEntry[0].gliderRefs.length; i++)
	        currEntry[0].gliderRefs[i].setProperty({color: currEntry[0].color});
	} catch (e) {
        // sometimes there are not any gliders and length is undefined.
	    //console.log(e);
	}

	displayColorToEntry(currEntry);
}
// Called whenever the drawer button is clicked
function onDrawerClick(e) {
    // Variables
    console.log("hi");
    var currEntry = $(this).parents(".entry");
    currEntry.find(".collapse").collapse("toggle");

    
}
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
	
	if(currEntry[0].graphRef)
		currEntry[0].gliderRefs.push(board.create("glider", [0, 0, currEntry[0].graphRef], {color: currEntry[0].color}));
	else
		currEntry.effect("shake", {times: 2}, 700);  // not sure this adds value
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
	{
		$(currEntry).find(".btn-add").trigger("click");
	}
	
	renderGraph(currEntry);
	
	if(currEntry.dashed)
	{
		$(currEntry).find(".dashed").click().click();
	}
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
        currEntry.oldLeft = 0;
        //slide back should be constrained to the window.
    } else {
        console.log($(currEntry).offset().left);
		if($(currEntry).offset().left> 0)
			currEntry.oldLeft = $(currEntry).offset().left;
		else
			currEntry.oldLeft=	1;
        $(currEntry).animate({ left: "-340px" }, "fast");
        //-340px should be dependent on the size of Entry really
        //TODO change the glyphicon to right
    }
    /*
	// Variables
	var	currEntry=	$(e.target).parents(".entry")[0];
	var	listbox=	$(".sideListbox")[0];
	
	listbox.items.push(currEntry);
	$(currEntry).hide();
	updateListbox();
    */
}

/*

// Called when one of the listbox items clicked on the entry
function uncollapseEntry(elem)
{
	// Variables
	var	listbox=	$(".sideListbox")[0];
	
	for(var i= 0; i< listbox.items.length; i++)
	{
		if(listbox.items[i]=== $(elem).parents(".item")[0].refEntry)
		{
			$($(elem).parents(".item")[0].refEntry).show();
			listbox.items=	removeFromArray(i, listbox.items);
			updateListbox();
			
			return;
		}
	}
}

// Removes the given index from the array
function removeFromArray(index, list)
{
	// Variables
	var	result=	new Array();
	
	for(var i= 0; i< list.length; i++)
	{
		if(i!= index)
			result.push(list[i]);
	}
	
	return result;
}

// Updates the listbox of entries
function updateListbox()
{
	// Variables
	var	listbox=	$(".sideListbox")[0];
	var	str=	"";
	
	if(listbox.items.length== 0)
		$(listbox).hide();
	else
		$(listbox).show();
	
	for(var i= 0; i< listbox.items.length; i++)
	{
		str+=	"<div class='item' style='background-color: "+($(listbox.items[i]).find(".showColor").css("background-color"))+";'>";
		str+=	"<span class='uncollapse' onclick='uncollapseEntry(this);'>";
		str+=	"<span class='glyphicon glyphicon-menu-right'></span>";
		str+=	"</span>";
		str+=	"</div>";
	}
	$(listbox).html(str);
	$(listbox).find(".item").each(function(index, elem)
	{
		elem.refEntry=	listbox.items[index];
	});
}*/

// End of File