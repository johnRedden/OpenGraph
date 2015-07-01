

/* Credit Lippm
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