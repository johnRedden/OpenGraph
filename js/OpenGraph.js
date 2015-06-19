
// Called when the page is ready and loaded
$(document).ready(function()
{
	if(location.hash!= "")
		updateEntry($(".entry")[0], location.hash.substring(1));
		
	$("#dockButton").click(onCollapseCollapser);
	$("#header").html("<em>OpenGraphingCalculator <sub>&alpha; 0.15</sub></em>");
});

// Called when the collapser has collapsed a collapsible collapser
function onCollapseCollapser(e)
{
	// Variables
	var	parent=	$($(e.target).parents(".controlContainer")[0]);
	var	cc=	parent.find(".buttons")[0];
	
	if(cc.style.visibility== "hidden")
	{
		cc.style.visibility=	"visible";
		cc.style.display=	"block";
		$(this).find(".glyphicon").removeClass("glyphicon-menu-left").addClass("glyphicon-menu-right");
	}
	else
	{
		cc.style.visibility=	"hidden";
		cc.style.display=	"none";
		$(this).find(".glyphicon").removeClass("glyphicon-menu-right").addClass("glyphicon-menu-left");
		parent.css({right: "0px"});
	}
}

// Writes into the given entry with the given string
function updateEntry(entry, str)
{
	// Variables
	var	fractions=	str.split("/");
	var	nstr=	str;
	
	if(fractions.length> 0 && str.indexOf("/")!= -1)
		nstr=	"\\frac{"+fractions[0]+"}{"+fractions[1]+"}";
	nstr=	nstr.replace("(", "\\left(");
	nstr=	nstr.replace(")", "\\right)");
	$(entry).find(".mathquill-editable").mathquill("write", nstr);
	renderGraph(entry);
}

// End of File