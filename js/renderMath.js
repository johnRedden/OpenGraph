

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

// A special trim that is used for the render functions to crop out the word and any whitespaces
function specialTrim(txt, substr)
{
	return txt.replace(/[\s]*[\*]*[\s]*/g, "").substring(substr);
}

// End of File