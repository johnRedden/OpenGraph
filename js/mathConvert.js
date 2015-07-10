
// all user information returned from any given entry
function getUserFunction(currEntry) {

    var fn, fnName, fnAsciiMath, fnIsGraphable, entryType, txt, filteredTxt;

    //txt should be clean asciiMath from the Entry LaTex
    txt = MQLaTextoAM(MathQuill(currEntry.find(".math-field")[0]).latex());

    entryType = getEntryType(txt);
    
    // function name is left of = and fn comes from expression to right of =
    if ( txt.indexOf("=") !== -1 ) {
        var inputStrs = txt.split("=");
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

    return {
        name: fnName.trim()[0],  //name is one char for now
        variable: 'x',      //todo: detect variable
        userFunction: fn,
        isGraphable: fnIsGraphable,
        type: entryType,
        text: txt
    };
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
			.replace(/\\operatorname\{s\*e\*c\*h}[\*]?/g, "sech");
	
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
    if (txt.indexOf("triangle") !== -1) { return "triangle"};
    if (txt.indexOf("quad") !== -1) { return "quad" };
    if (txt.indexOf("lagrange") !== -1) { return "lagrange"};
    if (txt.indexOf("line") !== -1) { return "line"};
    if (txt.indexOf("segment") !== -1) { return "segment" };
    if (txt.indexOf("circle") !== -1) { return "circle"};
    if (txt.indexOf("ellipse") !== -1) { return "ellipse" };
    if (txt.indexOf("parabola") !== -1) { return "parabola"};
    if (txt.indexOf("hyperbola") !== -1) { return "hyperbola" };
	if (txt.indexOf("polar") !== -1) { return "polar" };
	if (txt.indexOf("sec tor") !== -1) { return "sector" }; // TODO: This looks ugly, FIX
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
	tex = tex.replace(/x(x|\(|\[)/g, "x*$1");
	tex = tex.replace(/x(x|\(|\[)/g, "x*$1"); // Seems redundant, but it freakin works!
	
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
    return tex;
}