
// Called when the page is ready and loaded
$(document).ready(function()
{
	//if(location.hash!= "")
		//updateEntry($(".entry")[0], location.hash.substring(1));
		
	$("#dockButton").click(onCollapseCollapser);
	$("#header").html("<em>OpenGraphingCalculator <sub>&alpha; 0.15</sub></em>");
    //Init MathQuill
	$('.math-field').each(function () { MathQuill.MathField(this); });
	MathQuill.addAutoCommands('pi theta sqrt sum');
	
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
	try{
	MathQuill($(entry).find(".math-field")[0]).typedText(str);
	renderGraph(entry);
	} catch (e) {
        // use console.log()
	    //$("#header").text(e.message + " :: " + MathQuill($(".math-field")[0]));
	}
}

// End of File