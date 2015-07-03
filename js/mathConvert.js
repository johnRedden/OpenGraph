

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

function getUserFunction(currEntry) {

    var fn, fnName, fnAsciiMath, fnIsGraphable;

    //get LaTex from Entry convert to asciiMath
    txt = MQLaTextoAM(MathQuill(currEntry.find(".math-field")[0]).latex());
 
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
        console.log("in getUserFunction " + e);
    }
    if (txt.indexOf(",") === -1)
        fnIsGraphable = JXG.isFunction(fn);
    else
        fnIsGraphable = false;

    return {
        name: fnName.trim()[0],  //name is one char 
        variable: 'x',      //todo: detect variable
        userFunction: fn,
        isGraphable: fnIsGraphable
    };
}

// Our special case work
// special cases
function catchEntryText(entry, key) {

    // Variables
    var txt = "";
    var bGraph = false;

    try {
        txt = MathQuill(entry.find(".math-field")[0]).text();
        txt = filterText(txt, entry, key);

        if (txt.indexOf(",") !== -1) {

            txt = txt.replace(/[\*]?[\s]*,[\s]*[\*]?/g, ",").replace(/[\(\[]/g, "").replace(/[\)\]]/g, "");
            txt = txt.split(",");

            return {
                text: txt,
                type: "point",//{point: txt},
                canGraph: true
            };
        }
        if (txt.indexOf("x=") !== -1) {
            return {
                text: txt,
                type: "vline",//{vline: txt.substring(2)},
                canGraph: true
            };
        }
        /*
		if(txt.indexOf("y=")!== -1)
		{  //basically everyting with y= is labelled a hline?? that does not seem right
			return {
				text:	txt,
				type:	"hline",//{hline: txt.substring(2)},
				canGraph: true
			};
		}
		*/
        if (txt.indexOf("triangle") !== -1) {
            txt = txt.substring(8).toUpperCase();
            txt = txt.split("*");

            return {
                text: txt,
                type: "triangle",//{triangle: txt},
                canGraph: true
            };
        }
        if (txt.indexOf("quad") !== -1) {
            txt = txt.substring(4).toUpperCase();
            txt = txt.split("*");

            return {
                text: txt,
                type: "quad",//{quad: txt},
                canGraph: true
            };
        }
        if (txt.indexOf("line") !== -1) {
            txt = txt.substring(4).toUpperCase();
            txt = txt.split("*");

            return {
                text: txt,
                type: "line",//{line: txt},
                canGraph: true
            };
        }
        if (txt.indexOf("circle") !== -1) {
            txt = txt.substring(6).toUpperCase();
            txt = txt.split("*");

            return {
                text: txt,
                type: "circle",//{circle: txt},
                canGraph: true
            };
        }
        if (txt.indexOf("ellipse") !== -1) {
            txt = txt.substring(7).toUpperCase();
            txt = txt.split("*");

            return {
                text: txt,
                type: "ellipse",//{ellipse: txt},
                canGraph: true
            };
        }
        if (txt.indexOf("parabola") !== -1) {
            txt = txt.substring(8).toUpperCase();
            txt = txt.split("*");

            return {
                text: txt,
                type: "parabola",//{parabola: txt},
                canGraph: true
            };
        }
        if (txt.indexOf("hyperbola") !== -1) {
            txt = txt.substring(9).toUpperCase();
            txt = txt.split("*");

            return {
                text: txt,
                type: "hyperbola",//{hyperbola: txt},
                canGraph: true
            };
        }

        // Finds if it is graphable, unsure if we should detect here, or in the render function
        try {
            // Variables
            var userFunction;
            eval("userFunction= function(x) { with(Math) return " + mathjs(txt) + " }");
            if (JXG.isFunction(userFunction))
                bGraph = true;
        } catch (e) { console.log("caught " + e); }
    }
    catch (e) {
        console.log("caught " + e);
        bGraph = false;
    }

    return {
        text: txt,
        canGraph: bGraph
    };
}
// Filters the given text from mq Syntax syntax
function filterText(txt, entry, key) {
    // Gets hyperbolic functions by default
    txt = txt.toLowerCase()
			.replace(/\*\*[\*]?/g, "^")
			.replace(/cdot\s/g, "*")
			.replace(/\\s\*i\*n[\s]*[\*]?/g, "sin")
			.replace(/\\c\*s\*c[\s]*[\*]?/g, "csc")
			.replace(/\\c\*o\*s[\s]*[\*]?/g, "cos")
			.replace(/\\s\*e\*c[\s]*[\*]?/g, "sec")
			.replace(/\\t\*a\*n[\s]*[\*]?/g, "tan")
			.replace(/\\c\*o\*t[\s]*[\*]?/g, "cot")
			.replace(/\\operatorname\{c\*s\*c\*h}[\*]?/g, "csch")
			.replace(/\\operatorname\{s\*e\*c\*h}[\*]?/g, "sech")
			.replace(/\\l\*o\*g[\s]*[\*]?/g, "log")
			.replace(/\\l\*n[\s]*[\*]?/g, "ln")
			.replace(/t\*r\*i\*a\*n\*g\*l\*e[\*]?/g, "triangle")
			.replace(/q\*u\*a\*d[\*]?/g, "quad")
			.replace(/l\*i\*n\*e[\*]?/g, "line")
			.replace(/c\*i\*r\*c\*l\*e[\*]?/g, "circle")
			.replace(/e\*l\*l\*i\*p\*s\*e[\*]?/g, "ellipse")
			.replace(/p\*a\*r\*a\*b\*o\*l\*a[\*]?/g, "parabola")
			.replace(/h\*y\*p\*e\*r\*b\*o\*l\*a[\*]?/g, "hyperbola");

    if 
	(
		txt.indexOf("line") === -1 && txt.indexOf("circle") === -1 && txt.indexOf("triangle") === -1 &&
		txt.indexOf("quad") === -1 && txt.indexOf("ellipse") === -1 && txt.indexOf("parabola") === -1 &&
		txt.indexOf("hyperbola") === -1
	) {
        txt = txt.replace(/[\s]*[\*]*[\s]*/g, "");
    }
    else
        txt = txt.replace(/[\s]+\*/g, "");

    if ((key == 104 || key == 72) && txt.length >= 6) // Looks for 'h' or 'H'
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

    //$("#header").text(txt); // Live view of whats going on


    return txt;
}