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

// Called whenever there is a key detected on an entry mathinput
function onEntryKeyUp(e) {
	// Variables
    var currEntry = $(e.target).parents(".entry");
	
    if (e.keyCode === 13) {  //enter
        constructNewEntry();
    } else {
		// intervene with the users input (in mathConvert.js)
        //catchEntryText(currEntry, e.keyCode);
        autoFillSpecialFunctions(currEntry, e.keyCode);
        // try to render graph
		renderGraph(currEntry);
    }
}

function onEntryKeyDown(e) {
	// Variables
	var	entry=	$(e.target).parents(".entry");
	var	mf=	entry.find(".math-field");
	
	if(mf.width()> 200)
	{
		entry.width(mf.width()+167);
		entry.find(".mathinput").width(mf.width()+8);
	}
	else
	{
		entry.width(363);
		entry.find(".mathinput").width(204);
	}
}

// Renders the graph
function renderGraph(entry)
{
	// Variables
    var attr = {};
    var obj = getUserFunction(entry);
    var userFunction = obj.userFunction;
   

	if(entry[0].graphRef)
	{
		attr.dash=	(entry[0].graphRef).getAttribute("dash");
		attr.strokeColor=	(entry[0].graphRef).getAttribute("strokeColor");
		attr.strokeWidth=	(entry[0].graphRef).getAttribute("strokeWidth");
	}
	
	if(entry.has(entry.find(".dynamicOutput")[0]))
		entry.find('.dynamicOutput').remove();  
	if(obj.type)
	{
		try {
			switch(obj.type.toLowerCase())
			{
				case "point":	renderPoint(entry, attr, obj);	reRenderLines();	return;
				case "vline":	renderVerticalLine(entry, attr, obj);	return;
				case "triangle":	renderTriangle(entry, attr, obj);	return;
				case "line":	renderLine(entry, attr, obj);	return;
				case "segment":	renderSegment(entry, attr, obj);	return;
				case "circle":	renderCircle(entry, attr, obj);	return;
				case "ellipse":	renderEllipse(entry, attr, obj);	return;
				case "parabola":	renderParabola(entry, attr, obj);	return;
				case "hyperbola":	renderHyperbola(entry, attr, obj);	return;
				case "lagrange":	renderLagrange(entry, attr, obj);	return;
				case "sector":	renderSector(entry, attr, obj);	return;
				case "polar":
					renderCurve(entry, attr, obj);
					return;
				default:	break;
			}
		}catch(e) { console.log("caught "+e); }
	}
	
	try {
	// **********************main graphing here **************************
	    var hasPlottedPoint = false;
        
        // ******  Evaluating function notation and stand alone expressions ************
	    if (obj.text.indexOf("=") === -1) {// try to evaluate functions here... case where no equal

	        var insideStr = obj.text.substring(obj.text.indexOf("(") + 1, obj.text.length - 1);  // here f( insideStr )
			var	insideFN;
			try{
				eval("insideFn = function(x) { with(Math) return " + mathjs(insideStr) + " }");
			}catch(e){ console.log(e.message); }
	        var value = insideFn(0); // maybe composition here later?
	        
	        if (!isNaN(value)) {
                // get all of the current entries
	            var currEntries = entry.parents(".myForm").find(".entry");
	            
	            for (var i = 0; i < currEntries.length; i++) {
	                var obj = getUserFunction($(currEntries[i]));

                    // try to match name of entries to current text name (one char names only)
	                if (obj.name === txt[0].trim()) {
	                    // Here is where we evaluate
	                    var fn = obj.userFunction;
	                    var yn = fn(value);
	                    if (!$.isNumeric(yn) || !isFinite(yn) ){
	                        entry.find('.mathinput').append("<span class='dynamicOutput' style='float:right'> undefined </span>");
	                    } else {
	                        entry.find('.mathinput').append("<span class='dynamicOutput' style='float:right'>= " + fn(value).toFixed(4) + "</span>");
							
	                        //plot the point
	                        try {
	                            removeFromGraph(entry);
	                            entry[0].graphRef = board.create("point", [value, fn(value)],
                                {
                                    visible: true,
                                    strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
                                    strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
                                    fillColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
                                    fixed: true  //can make it dynamic here but choose not to
                                });
								entry[0].graphRef.setAttribute({dash: attr.dash});
	                            hasPlottedPoint = true;
	                        }
	                        catch (e) {
	                            //console.log("function point " + e);
	                        }
	                    }
	                    break;
	                }
	                    
	            }

	        }
	        // if no point has been plotted then there is no function to evaluate (should be numbers only)
	        if (!hasPlottedPoint) {
	            console.log("wtf");
	            //if (obj.text.indexOf("x") === -1 && obj.text.indexOf("y") === -1 && obj.text.length > 0)
	                entry.find(".mathinput").append("<span class='dynamicOutput' style='float:right'>=" + (obj.userFunction(0).toFixed(4)) + "</span>");
	        }
	            
	    }
	    // ******  End evaluating function notation ************
		

	    if (obj.isGraphable && !hasPlottedPoint) {
			removeFromGraph(entry);
		    // grpahing functiongraphs which is a jsxGraph curve
			entry[0].graphRef = board.create("functiongraph", userFunction,
			{
				visible: true,
				strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
				strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css('color'),
				fixed:	true
			});
			
			if(entry[0].graphRef && attr.mps)
			{
				for(var i= 0; i< attr.mps.length; i++)
				{
					board.create("glider" [0, 1, entry[0].graphRef],
					{
						visible:	true,
						strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
						strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css('color')
					});
				}
			}
			entry[0].graphRef.setAttribute({dash: attr.dash}); // Dashed attribute just didn't want to go into the board options
		}
	}
    catch (e) { 
        //console.log("caught " + e); 
    }
	//reRenderLines();
}
// Re renders any lines on the graph
function reRenderLines() {
    $(".entry").each(function (index, elem) {
        // Variables
        var txt = MathQuill($(elem).find(".math-field")[0]).text();

        if 
		(
			txt.indexOf("l*i*n*e") !== -1 || txt.indexOf("c*i*r*c*l*e") !== -1 ||
			txt.indexOf("e*l*l*i*p*s*e") !== -1 || txt.indexOf("p*a*r*a*b*o*l*a") !== -1 ||
			txt.indexOf("h*y*p*e*r*b*o*l*a") !== -1 || txt.indexOf("t*r*i*a*n*g*l*e") !== -1 ||
			txt.indexOf("q*u*a*d") !== -1
		) {
            onEntryKeyUp({
                target: $(elem).find(".math-field")[0],
                keyCode: 0
            });
        }
    });
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
	entry.remove();  // remove from DOM
}
// Removes the given object from the board
function removeFromGraph(entry)
{
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
            //console.log(d[el]); // Got them !!
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
        // JSXgraph setProperty has been depreciated...  use setAttribute
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

    // no map points on graphs that are points
    if (currEntry[0].graphRef && !JXG.isPoint(currEntry[0].graphRef)) {
	    board.create("glider", [0, 1, currEntry[0].graphRef], { color: currColor }).on('up', function (e) {
	        // map point on down stuff here TODO: add touch capabilties (current right-click to remove)
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
	//reRenderLines();  // not sure why we are rerendering here?
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

// Calculus  (can only do calc on jsxGraph curves *****************************************
function onNumAKeyUp(e) {
    var currEntry = $(e.target).parents(".entry");

    // used for the tangent line f'(a)
    if (currEntry[0].isTangentDisplayed) {
        board.removeObject(currEntry[0].isTangentDisplayed);
        graphTL(currEntry)
    }
    // used for the definite integal lower bound
    if (currEntry[0].isIntegralDisplayed) {
        board.removeObject(currEntry[0].isIntegralDisplayed.curveLeft);
        board.removeObject(currEntry[0].isIntegralDisplayed.curveRight);
        board.removeObject(currEntry[0].isIntegralDisplayed);
        graphIntegral(currEntry);
    }
    // used for riemann sums
    if (currEntry[0].isRsumDisplayed) {
        board.removeObject(currEntry[0].isRsumDisplayed);
        currEntry.find(".RSresult").html("");
        graphRS(currEntry);
    }
};
function onNumBKeyUp(e) {
    var currEntry = $(e.target).parents(".entry");

    // used for the definite integal upper bound
    if (currEntry[0].isIntegralDisplayed) {
        board.removeObject(currEntry[0].isIntegralDisplayed.curveLeft);
        board.removeObject(currEntry[0].isIntegralDisplayed.curveRight);
        board.removeObject(currEntry[0].isIntegralDisplayed);
        graphIntegral(currEntry);
    }
    // used for riemann sums
    if (currEntry[0].isRsumDisplayed) {
        board.removeObject(currEntry[0].isRsumDisplayed);
        currEntry.find(".RSresult").html("");
        graphRS(currEntry);
    }

};

function onTangentLineClick(e) {
    var currEntry = $(e.target).parents(".entry");
    
    if (currEntry[0].isTangentDisplayed) {
        board.removeObject(currEntry[0].isTangentDisplayed);
        currEntry[0].isTangentDisplayed = null;
        currEntry.find(".RSresult").html("");
    } else {
        if (currEntry[0].graphRef) {
            graphTL(currEntry);
        }
    }
};

function graphTL(currEntry) {
    var szeFn = function () {
        var n = currEntry[0].graphRef.getAttribute('strokeWidth');
        return (n > 1) ? n - 1 : 1;
    };
    var graphColor = currEntry[0].graphRef.getAttribute('strokeColor');

    var d1 = parseFloat(currEntry.find('.numA').val());
    if (isNaN(d1)) { d1 = 1.0 }

    var obj = getUserFunction(currEntry);
    var userFunction = obj.userFunction;
    
    //todo: change later when functon notation is enabled
    if (obj.isGraphable && currEntry[0].graphRef.getType() === 'curve') {
        try {
            var p1 = board.create("glider", [d1, userFunction(d1), currEntry[0].graphRef], { strokeColor: graphColor, fillColor: graphColor, name: '' });
            currEntry.find(".RSresult").html("f '(" + p1.X().toFixed(2) + ") = " + JXG.Math.Numerics.D(userFunction)(p1.X()).toFixed(2));

            p1.on('drag', function () {
                currEntry.find('.numA').val(p1.X().toFixed(2));
                currEntry.find(".RSresult").html("f '(" + p1.X().toFixed(2) + ") = " + JXG.Math.Numerics.D(userFunction)(p1.X()).toFixed(2));
            });
            currEntry[0].isTangentDisplayed = p1;

            //do not what to add tangent as a child of graph becase the color will change (Gray is better for tangent line.)
            board.create('tangent', [p1], { strokeColor: '#888888', strokeWidth: szeFn });
        } catch (e) {
            //something could go wrong
        }
    }

}

function onDerivativeClick(e) {
    var currEntry = $(e.target).parents(".entry");

    if (currEntry[0].isDerivDisplayed) {
        board.removeObject(currEntry[0].isDerivDisplayed);
        currEntry[0].isDerivDisplayed = null;
    } else {
        if (currEntry[0].graphRef && currEntry[0].graphRef.getType() === 'curve') {
            var szeFn = function () {
                var n = currEntry[0].graphRef.getAttribute('strokeWidth');
                return (n > 1) ? n - 1 : 1;
            };
            var graphColor = currEntry[0].graphRef.getAttribute('strokeColor');

            var obj = getUserFunction(currEntry);
            var userFunction = obj.userFunction;

            try {
                if (obj.isGraphable )  {
                        currEntry[0].isDerivDisplayed = board.create('functiongraph', [JXG.Math.Numerics.D(userFunction)], { strokeColor: graphColor, strokeWidth: szeFn, dash: 2 });
                        currEntry[0].graphRef.addChild(currEntry[0].isDerivDisplayed);
                    }
                } catch (e) {
                    //do something
                }
        }
    }
	
};
function onSecondDerivativeClick(e) {
    var currEntry = $(e.target).parents(".entry");

    if (currEntry[0].is2DerivDisplayed) {
        board.removeObject(currEntry[0].is2DerivDisplayed);
        currEntry[0].is2DerivDisplayed = null;
    } else {
        if (currEntry[0].graphRef && currEntry[0].graphRef.getType() === 'curve') {
            var szeFn = function () {
                var n = currEntry[0].graphRef.getAttribute('strokeWidth');
                return (n > 1) ? n - 1 : 1;
            };
            var graphColor = currEntry[0].graphRef.getAttribute('strokeColor');

            var obj = getUserFunction(currEntry);
            var userFunction = obj.userFunction;

            var firstD = JXG.Math.Numerics.D(userFunction);
            var secondD = JXG.Math.Numerics.D(firstD);

            try {
                //todo: change later when functon notation is enabled
                if (obj.isGraphable) {

                    currEntry[0].is2DerivDisplayed = board.create('functiongraph', [secondD], { strokeColor: graphColor, strokeWidth: szeFn, dash: 2 });
                    currEntry[0].graphRef.addChild(currEntry[0].is2DerivDisplayed);
                }
            } catch (e) {
                //do something
            }
        }
    }

};
function onIntegralClick(e){
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
		    graphIntegral(currEntry);
		}
	}
}

function graphIntegral(currEntry) {
    var d1 = parseFloat(currEntry.find('.numA').val());
    if (isNaN(d1)) { d1 = 1.0 }
    var d2 = parseFloat(currEntry.find('.numB').val());
    if (isNaN(d2)) { d2 = 2.0 }

    var obj = getUserFunction(currEntry);
    
    if (obj.isGraphable && currEntry[0].graphRef.getType() === 'curve') {  // only on jsxGraph curves
        
        currEntry[0].isIntegralDisplayed = board.create("integral", [[d1, d2], currEntry[0].graphRef], { color: 'purple', fillOpacity: 0.2, frozen: true });
        currEntry[0].isIntegralDisplayed.curveLeft.setAttribute({ withLabel: true });
        currEntry[0].isIntegralDisplayed.curveRight.setAttribute({ withLabel: true });
        currEntry[0].isIntegralDisplayed.curveLeft.on('drag', function () {
            currEntry.find('.numA').val(this.X().toFixed(2));
            // used for riemann sums
            if (currEntry[0].isRsumDisplayed) {
                board.removeObject(currEntry[0].isRsumDisplayed);
                currEntry.find(".RSresult").html("");
                graphRS(currEntry);
            }
        });
        currEntry[0].isIntegralDisplayed.curveRight.on('drag', function () {
            currEntry.find('.numB').val(this.X().toFixed(2));
            // used for riemann sums
            if (currEntry[0].isRsumDisplayed) {
                board.removeObject(currEntry[0].isRsumDisplayed);
                currEntry.find(".RSresult").html("");
                graphRS(currEntry);
            }
        });
        //currEntry[0].graphRef.addChild(currEntry[0].isIntegralDisplayed);
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

    var obj = getUserFunction(currEntry);
    var userFunction = obj.userFunction;

    //todo: change later when functon notation is enabled
 
    if (obj.isGraphable && currEntry[0].graphRef.getType() === 'curve') {
        try{
            currEntry[0].isRsumDisplayed = board.create('riemannsum', [userFunction, n, t, d1, d2], { color: 'orange', fillOpacity: 0.2 });

            currEntry[0].graphRef.addChild(currEntry[0].isRsumDisplayed);
            currEntry.find(".RSresult").html("&sum; = " + JXG.Math.Numerics.riemannsum(userFunction, n, t, d1, d2).toFixed(4));
        } catch (e) {
            // conics throw errors
        }
    }

};

//************************* End Calculus ************************

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
