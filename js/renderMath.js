

// Renders a circle
function renderCircle(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 6).toUpperCase();
	
	// Variables
	var	ptA=	board.select(obj.text[0]);
	var	ptB=	board.select(obj.text[1]);
	
	removeFromGraph(entry);
	if(JXG.isPoint(ptA) && JXG.isPoint(ptB))
	{
		entry[0].graphRef=	board.create("circle", [ptA, ptB],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed: true
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
	}
}

// Renders an ellipse
function renderEllipse(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 7).toUpperCase();
	
	// Variables
	var	ptA=	board.select(obj.text[0]);
	var	ptB=	board.select(obj.text[1]);
	var	ptC=	board.select(obj.text[2]);
	
	removeFromGraph(entry);
	if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
	{
		entry[0].graphRef=	board.create("ellipse", [ptA, ptB, ptC],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed: true
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
	}
}

// Renders a segment
function renderSegment(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 7).toUpperCase();
	
	// Variables
	var ptA = board.select(obj.text[0]);
	var ptB = board.select(obj.text[1]);
	
	removeFromGraph(entry);
	if (JXG.isPoint(ptA) && JXG.isPoint(ptB)) {
		entry[0].graphRef = board.create("segment", [ptA, ptB],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed:true
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
	}
}

// Renders the line
function renderLine(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 4).toUpperCase();
	
	// Variables
	var	ptA=	board.select(obj.text[0]);
	var	ptB=	board.select(obj.text[1]);
	
	removeFromGraph(entry);
	if(JXG.isPoint(ptA) && JXG.isPoint(ptB))
	{
		entry[0].graphRef=	board.create("line", [ptA, ptB],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed: true
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
	}
}

// Renders a triangle
function renderTriangle(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 8).toUpperCase();
	
	// Variables
	var	ptA=	board.select(obj.text[0]);
	var	ptB=	board.select(obj.text[1]);
	var	ptC=	board.select(obj.text[2]);
	
	removeFromGraph(entry);
	if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
	{
		entry[0].graphRef=	board.create("polygon", [ptA, ptB, ptC],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color")
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
	}
}

// Renders a vertical line
function renderVerticalLine(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 2).toLowerCase();
	
	removeFromGraph(entry);
	entry[0].graphRef = board.create("line", [-1 * parseFloat(obj.text), 1, 0],
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
	entry[0].graphRef.setAttribute({dash: attr.dash});
}

// Renders a point
function renderPoint(entry, attr, obj)
{
	// Variables
	var tt = obj.text.replace('(', '').replace(')','').split(',');
	
	removeFromGraph(entry);
	entry[0].graphRef = board.create("point", [parseFloat(tt[0]), parseFloat(tt[1])],
	{
		strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
		strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
		fillColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
		fixed:false
	}).on('drag', function () {
		var px = this.X().toFixed(2);
		var py = this.Y().toFixed(2);

		if (px == "-0.00")
			px = "0.00"
		if (py == "-0.00")
			py = "0.00"

		MathQuill(entry.find(".math-field")[0]).latex("").typedText("(" + px +"," + py + ")").blur();
	});
	entry[0].graphRef.setAttribute({dash: attr.dash});
}

// Renders a parabola
function renderParabola(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 8).toUpperCase();
	
	// Variables
	var	ptA = board.select(obj.text[0]);
	var ptB = board.select(obj.text[1]);
	var ptC = board.select(obj.text[2]);
	
	if(entry[0].embeddedParabolaLine)
		entry[0].embeddedParabolaLine=	null; // Delete somehow
	removeFromGraph(entry);
	if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
	{
		
		var l = board.create('line', [ptC, ptB]);
		entry[0].graphRef = board.create("parabola", [ptA, l],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed: true
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
		entry[0].embeddedParabolaLine=	l;
		// entry[0].graphRef.addChild(l);
		// the above line crashes the app on Entry delete for some reason??
	}
}

// Renders a hyperbola
function renderHyperbola(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 9).toUpperCase();
	
	// Variables
	var	ptA=	board.select(obj.text[0]);
	var	ptB=	board.select(obj.text[1]);
	var	ptC=	board.select(obj.text[2]);
	
	removeFromGraph(entry);
	if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
	{
		entry[0].graphRef=	board.create("hyperbola", [ptA, ptB, ptC],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed: true
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
	}
}

// Renders a lagrange function
function renderLagrange(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 8).toUpperCase();
	
	// Variables
	var pts = [];
	var golagrange = true;
	for (var i = 0; i < obj.text.length; i++) {
		pts[i] = board.select(obj.text[i]);
		if (!JXG.isPoint(pts[0])) {
			golagrange = false;
			break;
		}
	}
	
	removeFromGraph(entry);
	if(golagrange) {
		
		var f = JXG.Math.Numerics.lagrangePolynomial(pts);
		entry[0].graphRef = board.create("functiongraph", [f],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed:true
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
	}
}

// Renders a sector
function renderSector(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 6).toUpperCase();
	
	// Variables
	var	ptA=	board.select(obj.text[0]);
	var	ptB=	board.select(obj.text[1]);
	var	ptC=	board.select(obj.text[2]);
	
	entry.find(".mq-last").removeClass("mq-last"); // Is there a better way here?
	removeFromGraph(entry);
	if(JXG.isPoint(ptA) && JXG.isPoint(ptB) && JXG.isPoint(ptC))
	{
		entry[0].graphRef=	board.create("sector", [ptA, ptB, ptC],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed: true
		});
		entry[0].graphRef.setAttribute({dash: attr.dash});
	}
}

// Renders a curve
function renderCurve(entry, attr, obj)
{
	switch(obj.type.toLowerCase())
	{
		case "polar":	renderPolarCurve(entry, attr, obj);	break;
		// TODO: Include more of the other curves?? ( http://jsxgraph.uni-bayreuth.de/docs/symbols/Curve.html )
	}
}

// Renders a polar curve /* polar(mainFunc, funcA, funcB, locX, locY); */
function renderPolarCurve(entry, attr, obj)
{
	obj.text=	specialTrim(obj.text, 5).replace(/\(/g, "").replace(/\)/g, "");
	
	// Variables
	var	parameters=	obj.text.split(",");
	var	nparams;
	
	for(var i= 0; i< parameters.length; i++)
	{
		if(i=== 3 || i=== 4)
		{
			if(isNaN(parameters[i]))
				parameters[i]=	0;
			
			continue;
		}
		eval("parameters["+i+"]= function(x) { with(Math) return "+parameters[i]+"; };");
	}
	
	nparams=	[parameters[0], [0,0]];
	if(parameters[1])
		nparams[2]=	parameters[1];
	if(parameters[2])
		nparams[3]=	parameters[2];
	if(parameters[3])
		nparams[1]=	[parseFloat(parameters[3]), 0];
	if(parameters[4])
		nparams[1]=	[parseFloat(parameters[3]), parseFloat(parameters[4])];
	
	removeFromGraph(entry);
	entry[0].graphRef=	board.create("curve", nparams,
	{
		curveType:	"polar",
		visible: true,
		strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
		strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
		fixed:true
	});
}

// Renders an inequality
function renderInequality(entry, attr, obj)
{
	// Variables
	var	splits;
	var	bDashed=	true;
	var	xLoc=	1;
	var	bInverse=	false;
	var	userFunction;
	
	if(entry[0].inequalityPointA)
		board.removeObject(entry[0].inequalityPointA);
	if(entry[0].inequalityPointB)
		board.removeObject(entry[0].inequalityPointB);
	if(entry[0].inequalityLine)
		board.removeObject(entry[0].inequalityLine);
	removeFromGraph(entry);
	
	if(obj.text.indexOf("^")!== -1 || (obj.text.indexOf("<")=== obj.text.length-1 || obj.text.indexOf(">")=== obj.text.length-1) || obj.text.indexOf("y")=== -1)
		return;
	
	if(obj.text.indexOf("=")!== -1)
	{
		bDashed=	false;
		obj.text=	obj.text.replace("=", "");
	}
	if(obj.text.indexOf("<")!== -1)
	{
		splits=	obj.text.split("<");
		bInverse=	false;
	}
	else if(obj.text.indexOf(">")!== -1)
	{
		splits=	obj.text.split(">");
		bInverse=	true;
	}
	if(splits[0].indexOf("y")=== -1)
	{
		xLoc=	0;
		bInverse=	!bInverse;
	}
	
	try
	{
		eval("userFunction = function(x) { with(Math) return "+mathjs(splits[xLoc])+"; }");
		entry[0].inequalityPointA=	board.create("point", [-1, userFunction(-1)]);
		entry[0].inequalityPointB=	board.create("point", [1, userFunction(1)]);
		entry[0].inequalityLine=	board.create("line", [entry[0].inequalityPointA, entry[0].inequalityPointB]);
		entry[0].graphRef=	board.create("inequality", [entry[0].inequalityLine],
		{
			visible: true,
			strokeWidth: attr.strokeWidth ? attr.strokeWidth : 2,
			strokeColor: attr.strokeColor ? attr.strokeColor : entry.find(".showColor").css("color"),
			fixed: true,
			inverse: bInverse
		});
		// TODO: Have a move event listener that changes the formula as you move it around
		// TODO: Set dashed according to the bDashed variable
	}
	catch(e) { console.log("caught "+e); }
}

// A special trim that is used for the render functions to crop out the word and any whitespaces
function specialTrim(txt, substr)
{
	return txt.replace(/[\s]*[\*]*[\s]*/g, "").substring(substr);
}

// End of File