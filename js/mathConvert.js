
// all user information returned from any given entry
function getUserFunction(currEntry) {

    var fn, fnName, fnAsciiMath, fnIsGraphable, fnIsEvaluateable, entryType, txt, filteredTxt, renewedFuncNotation;

    //txt should be clean asciiMath from the Entry LaTex
    txt = MQLaTextoAM(MathQuill(currEntry.find(".math-field")[0]).latex());
	txt=	findAndReplaceKnownFunctions(txt, currEntry);
	$("#header").text(txt);
	
    entryType = getEntryType(txt);
    
    // function name is left of = and fn comes from expression to right of =
    if ( txt.indexOf("=") !== -1 ) {
        var inputStrs = txt.split("=");
		
		if(inputStrs[1].indexOf(inputStrs[0])!== -1)
		{
			inputStrs[0]=	'';
			inputStrs[1]=	txt;
		}
        fnName = inputStrs[0];
        fnAsciiMath = inputStrs[1]; 
    } else {
        fnName = '';
        fnAsciiMath = txt;
    }

    // javascript math conversion here using  mathjs.js 
    try{
        eval("fn = function(x) { with(Math) return " + mathjs(fnAsciiMath) + " }");

    }catch(e){
        //console.log("in getUserFunction " + e);
    }
	
	if(fnName!== '' && fnName.replace(/\s/g, "").indexOf("(x)")!== -1)
	{
		currEntry[0].funcCreated=	{ // Is there a better name to this?
			name:	fnName.substring(0, fnName.indexOf("(")),
			asciiOrigin:	fnAsciiMath,
			func:	fn
		};
	}

    if( entryType === 'function')
    {
        fnIsGraphable = JXG.isFunction(fn);
    }
    else
        fnIsGraphable = false;

    //special lagrange function here
    if (entryType === "lagrange") {
        var inputStrs = txt.substring(8).toUpperCase().trim();
        inputStrs = inputStrs.split(""); // a little different than the others

        var pts = [];
        fnIsGraphable = true;
        for (var i = 0; i < inputStrs.length; i++) {
            pts[i] = board.select(inputStrs[i]);
            if (!JXG.isPoint(pts[0])) {
                fnIsGraphable = false;
                break;
            }
        }
        fn = JXG.Math.Numerics.lagrangePolynomial(pts);
        // fyi lagrange function is a jsxGraph curve
    }

    try
	{
		console.log(fn(0));
	}
	catch(e)	{ fn=	function(x){return "x";};	}

    return {
        name: fnName.trim()[0],  //name is one char for now
        variable: 'x',      //todo: detect variable
        userFunction: fn,
        isGraphable: fnIsGraphable,
        isEvaluateable: (fn(0)===NaN)?false:true,
        type: entryType,
        text: txt
    };
}

// Finds and replaces all the known functions with whatever they have
function findAndReplaceKnownFunctions(text, entry)
{
	// Variables
	var	index=	0;
	var	nested=	0;
	var	lp=	-1;
	var	rp=	-1;
	var	sp=	-1;
	var	ep=	-1;
	var	funcsCreated=	new Array();
	
	$(".entry").each(function(index, elem)
	{
		if(elem.funcCreated)
		{
			if(entry[0].funcCreated)
			{
				if(elem.funcCreated.name=== entry[0].funcCreated.name)
					return;
			}
			
			funcsCreated.push(elem.funcCreated);
		}
	});
	
	if(funcsCreated.length=== 0)
		return text;
	
	while(true)
	{
		try
		{
			if(index>= text.length)
				break;
			for(var i= 0; i< funcsCreated.length; i++)
			{
				if(index< text.indexOf("(", index) && funcsCreated[i].name+"("== text.substring(index, text.indexOf("(", index)+1)) // Found a match!
				{
					index=	text.indexOf(funcsCreated[i].name+"(", index);
					nested=	0;
					sp=	index+funcsCreated[i].name.length+1;
					do
					{
						lp=	text.indexOf("(", index+1);
						rp=	text.indexOf(")", index+1);
						if(lp!== -1 && lp< rp)
						{
							index=	lp;
							nested++;
						}
						else if(rp!== -1 && (lp=== -1 || rp< lp))
						{
							index=	rp;
							nested--;
						}
					}while(nested> 0 && rp!== -1);
					ep=	rp;
					if(text.substring(sp, ep).indexOf("x")=== -1) // Found no x's or anything
						text=	text.substring(0, sp-funcsCreated[i].name.length-1)+funcsCreated[i].func(eval(text.substring(sp, ep)))+text.substring(ep+1);
					else
					{
						// Variables
						var	prefix=	"";
						var	temp=	funcsCreated[i].asciiOrigin;
						var	suffix=	"";
						
						temp=	"("+temp.replace(/x/g, "("+text.substring(sp, ep)+")")+")";
						if(sp-2!== 0)
							prefix=	text.substring(0, sp-funcsCreated[i].name.length-1);
						if(ep+2< text.length)
							suffix=	text.substring(ep+1);
						text=	prefix+temp+suffix;
					}
					index=	sp-funcsCreated[i].name.length;
				}
			}
			index++;
		} catch(e) { console.log("caught "+e); }
	}
	
	return text;
}

// Auto fills any special functions like sin, cos, tan, etc.  
function autoFillSpecialFunctions(entry, key) {
    txt = MathQuill(entry.find(".math-field")[0]).text();

    // Gets hyperbolic functions by default
    txt = txt.toLowerCase()
			.replace(/\\s\*i\*n[\s]*[\*]?/g, "sin")
			.replace(/\\c\*s\*c[\s]*[\*]?/g, "csc")
			.replace(/\\c\*o\*s[\s]*[\*]?/g, "cos")
			.replace(/\\s\*e\*c[\s]*[\*]?/g, "sec")
			.replace(/\\t\*a\*n[\s]*[\*]?/g, "tan")
			.replace(/\\c\*o\*t[\s]*[\*]?/g, "cot")
			.replace(/\\operatorname\{c\*s\*c\*h}[\*]?/g, "csch")
			.replace(/\\operatorname\{s\*e\*c\*h}[\*]?/g, "sech")
			.replace(/\\l\*n[\s]*[\*]?/g, "ln")
			.replace(/\\l\*o\*g[\s]*[\*]?/g, "log");
	
	if((key== 116 || key== 84) && txt.length>= 6) // Looks for 't' or 'T'
	{
		switch(txt.substring(txt.length-6))
		{
			case "sec(t)":
				MathQuill(entry.find(".math-field")[0]).latex("");
				MathQuill(entry.find(".math-field")[0]).typedText("sect");
				break;
		}
	}
    else if ((key == 104 || key == 72) && txt.length >= 6) // Looks for 'h' or 'H'
    {
        switch (txt.substring(txt.length - 6)) {
            case "sin(h)":
            case "csc(h)":
            case "cos(h)":
            case "sec(h)":
            case "tan(h)":
            case "cot(h)":
                MathQuill(entry.find(".math-field")[0]).latex(""); // Deletes everything on the entry
                txt = txt.substring(0, txt.length - 3) + "h("; // Formulates everything to make it hyperbolic
                MathQuill(entry.find(".math-field")[0]).typedText(txt); // Rewrites everything back on
                break;
        }
    }
    else if (key != 8 && key != 127) // Else if they are not pressing backspace or delete, so there is no fighting
    {
        if (txt.length >= 3) {
            switch (txt.substring(txt.length - 3)) {
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
        if (txt.length >= 2) {
            switch (txt.substring(txt.length - 2)) {
                case "ln":
                    MathQuill(entry.find(".math-field")[0]).typedText("(");
                    break;
            }
        }
    }
}

function getEntryType(txt) {
	
    // this function could take in the entry
    if (txt.indexOf("x=") !== -1) { return "vline" };
	if (txt.indexOf("<") !== -1 || txt.indexOf(">") !== -1) { return "inequality";	}
    if (txt.indexOf("triangle") !== -1) { return "triangle"};
    if (txt.indexOf("lagrange") !== -1) { return "lagrange"};
    if (txt.indexOf("line") !== -1) { return "line"};
    if (txt.indexOf("segment") !== -1) { return "segment" };
    if (txt.indexOf("circle") !== -1) { return "circle"};
    if (txt.indexOf("ellipse") !== -1) { return "ellipse" };
    if (txt.indexOf("parabola") !== -1) { return "parabola"};
    if (txt.indexOf("hyperbola") !== -1) { return "hyperbola" };
	if (txt.indexOf("polar") !== -1) { return "polar" };
	if (txt.indexOf("sec tor") !== -1) { return "sector" };
    if (txt.indexOf(",") !== -1) { return "point" };
    // if no variable return "arithmetic"
    return "function";

}

/* Credit Lippman
\left| expr \right| to  abs(expr)
\left( expression \right)  to   (expression)
\sqrt{expression}  to sqrt(expression)
\nthroot{n}{expr}  to  root(n)(expr)
\frac{num}{denom} to (num)/(denom)
\langle whatever \rangle   to   < whatever >                 **not done yet
\begin{matrix} a&b\\c&d  \end{matrix}    to  [(a,b),(c,d)]   **not done yet
n\frac{num}{denom} to n num/denom
*/
function MQLaTextoAM(tex) {
    //alert(tex);
    tex = tex.replace(/\\:/g, ' ');
    while ((i = tex.indexOf('\\left|')) != -1) { //found a left |
        nested = 0;
        do {
            lb = tex.indexOf('\\left|', i + 1);
            rb = tex.indexOf('\\right|', i + 1);
            if (lb != -1 && lb < rb) {	//if another left |
                nested++;
            } else if (rb != -1 && (lb == -1 || rb < lb)) {  //if right |
                nested--;
            }
        } while (nested > 0 && rb != -1);  //until nested back to 0 or no right |
        if (rb != -1) {  //have a right |  - replace with abs( )
            tex = tex.substring(0, rb) + ")" + tex.substring(rb + 7);
            tex = tex.substring(0, i) + "abs(" + tex.substring(i + 6);
        } else {
            tex = tex.substring(0, i) + "|" + tex.substring(i + 6);
        }
    }
    tex = tex.replace(/\\text{\s*or\s*}/g, ' or ');
    tex = tex.replace(/\\text{all\s+real\s+numbers}/g, 'all real numbers');
    tex = tex.replace(/\\le(?!f)/g, '<=');
    tex = tex.replace(/\\ge/g, '>=');
    tex = tex.replace(/\\cup/g, 'U');
    tex = tex.replace(/\\left/g, '');
    tex = tex.replace(/\\right/g, '');
    tex = tex.replace(/\\langle/g, '<');
    tex = tex.replace(/\\rangle/g, '>');
    tex = tex.replace(/\\pm/g, '+-');
    tex = tex.replace(/\\cdot/g, '*');
    tex = tex.replace(/\\infty/g, 'oo');
    tex = tex.replace(/\\nthroot/g, 'root');
    tex = tex.replace(/\\varnothing/g, 'DNE');
    tex = tex.replace(/\\/g, '');
    tex = tex.replace(/sqrt\[(.*?)\]/g, 'root($1)');
    tex = tex.replace(/(\d)frac/g, '$1 frac');
	tex = tex.replace(/pi/g, "pi ");
	tex = tex.replace(/x(\d|x|y|f|g|sin|cos|tan|csc|sec|cot|\(|\[|ln|log|pi)/g, "x*$1");
	tex = tex.replace(/x(\d|x|y|f|g|sin|cos|tan|csc|sec|cot|\(|\[|ln|log|pi)/g, "x*$1"); // TODO: Improve this a little more?
	
    while ((i = tex.indexOf('frac{')) != -1) { //found a fraction start
        nested = 1;
        curpos = i + 5;
        while (nested > 0 && curpos < tex.length - 1) {
            curpos++;
            c = tex.charAt(curpos);
            if (c == '{') { nested++; }
            else if (c == '}') { nested--; }
        }
        if (nested == 0) {
            tex = tex.substring(0, i) + "(" + tex.substring(i + 5, curpos) + ")/" + tex.substring(curpos + 1);
        } else {
            tex = tex.substring(0, i) + tex.substring(i + 4);
        }
    }
    tex = tex.replace(/_{([\d\.]+)}/g, '_$1');
    tex = tex.replace(/{/g, '(');
    tex = tex.replace(/}/g, ')');
    tex = tex.replace(/\(([\d\.]+)\)\/\(([\d\.]+)\)/g, '$1/$2');  //change (2)/(3) to 2/3
    tex = tex.replace(/\/\(([\d\.]+)\)/g, '/$1');  //change /(3) to /3
    tex = tex.replace(/\(([\d\.]+)\)\//g, '$1/');  //change (3)/ to 3/
    tex = tex.replace(/\/\(([\a-zA-Z])\)/g, '/$1');  //change /(x) to /x
    tex = tex.replace(/\(([\a-zA-Z])\)\//g, '$1/');  //change (x)/ to x/
    tex = tex.replace(/\^\(-1\)/g, '^-1');
    tex = tex.replace(/\^\((-?[\d\.]+)\)/g, '^$1');
    return tex.toLowerCase();
}