
// Called when the page is ready and loaded
$(document).ready(function()
{
	detectMobile();
	$(window).resize(detectMobile);
	if(location.hash!= "")
		//updateEntry($(".entry")[0], location.hash.substring(1));
		
	$("#dockButton").click(onCollapseCollapser);
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
/*
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
	$("#m-entry").find("textarea").val(str);
	renderGraphMobile($("#m-entry")[0]);
}
*/

// Changes the header of the page
function changeHeader(str)
{
	$("#header").html(str);
}

// Fades away the entries from visibility
function fadeEntries()
{
	$(".entry").each(function(index, elem)
	{
		if(elem.style.visibility== "")
			elem.style.visibility=	"visible";
		
		if(elem.style.visibility== "visible")
		{
			elem.style.visibility=	"hidden";
			elem.style.opacity=	"0";
			$(elem).hide(800);
		}
		else
		{
			elem.style.visibility=	"visible";
			elem.style.opacity=	"1";
			$(elem).show(800);
		}
	});
}

// Detects if the page is being used on a smaller screen
function detectMobile()
{
    bMobile = (navigator.appVersion.toLowerCase().indexOf("android"))!= -1; // Looks for only android
	
	if(!bMobile)
	{
		removeFromGraph($("#m-entry")[0]);
		$(".entry").each(function(index, elem)
		{
			elem.style.visibility=	"visible";
			elem.style.display=	"block";
			$(elem).show();
			renderGraph($(".entry")[index]);
		});
		changeHeader("<em>OpenGraphingCalculator <sub>&alpha; 0.15</sub></em>");
		resizeBoard();
		
		return;
	}
	
	renderGraphMobile($("#m-entry")[0]);
	$(".entry").each(function(index, elem)
	{
		elem.style.visibility=	"hidden";
		elem.style.display=	"none";
		$(elem).hide();
		removeFromGraph($(".entry")[index]);
	});
	resizeBoardMobile();
	changeHeader("<em>OpenGraph Mobile <sub>&alpha; 0.1</sub></em>");
}

// End of File