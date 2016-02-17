

var MARGIN = 0.5
var HOFFSET = -0.1
var VOFFSET = -0.6

/* Uncomment for automatic refresh */
//document.getElementById('txtInput').onkeyup = Update
//document.getElementById('txtInput').onchange = Update
//window.onload = Update

document.getElementById('btnInput').onclick = Update

function viewport()
{
	var e = window,
		a = 'inner';
	if (!('innerWidth' in window)) {
		a = 'client';
		e = document.documentElement || document.body;
	}
	return {
		width: e[a + 'Width'],
		height: e[a + 'Height']
	}
}

function Update()
{

	/* read graph input */
	var text = document.getElementById('txtInput').value
	var graph = JSON.parse(text)

	if(!graph.nodes)
		return;

	/* measure size of leaf boxes */
	graph.nodes.forEach(measureSizeRec)

	var width = viewport().width;
	var height = viewport().height;

	layoutGraph(graph, width, height)

}

function layoutGraph(graph, width, height)
{

	/* remove all svg elements */
	var allSvgs = document.querySelectorAll("svg");
	[].forEach.call(allSvgs, function(svg) {
		svg.parentNode.removeChild(svg)
	})

	var zoom = d3.behavior.zoom()
	    .on("zoom", function() { redraw(svg) });

	var svg = d3.select("body")
		.append("svg")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
		.attr("xmlns:ev", "http://www.w3.org/2001/xml-events")
		.attr("id", "svgOutput")
		.attr("version", "1.1")
		.attr("baseprofile", "full")
		.attr("width", width + "mm")
		.attr("height", height + "mm")
    .call(zoom)
		.append("g")

	// group shizzle
	var root = svg.append("g")

	var layouter = klay.d3adapter()
		.nodes(graph.nodes)
		.links(graph.links)
		.size([width, height])
		.transformGroup(root)
		.options({
			edgeRouting: "ORTHOGONAL",
        intCoordinates: false
		})
    .defaultPortSize([2, 2])

	layouter
		.on("finish", _.partial(layouter_on_finish, layouter, root))
    .start();

}

function layouter_on_finish(layouter, root, d2)
{

	var nodes = layouter.nodes();
	var links = layouter.links(nodes);

	var idfun = function(d) { if(d.labels) return d.id; };
	var labelfun = function(d) { return d.children ? "" : (d.name || "") };

	var linkData = root
		.selectAll(".link")
		.data(links, idfun)
		.enter()
		.append("path")
		.attr("class", "link")
		.attr("d", function(d)
		{
			var path = "";
			path += "M" + d.sourcePoint.x + " " + d.sourcePoint.y + " ";
			(d.bendPoints || []).forEach(function(bp, i) {
					path += "L" + bp.x + " " + bp.y + " ";
			});
			path += "L" + d.targetPoint.x + " " + d.targetPoint.y + " ";
			return path;
		});

	var node = root.selectAll(".node")
		.data(nodes, idfun)
		.enter()
		.append("g")
		.attr("class", function(d) {
				if (d.children)
					return "compound";
				else
					return "leaf";
		});

	var atoms = node
		.append("rect")
		.attr("width", function(d){ return d.width; })
		.attr("height", function(d){ return d.height; })
		//.attr("x", function(d){ return d.x })
		//.attr("y", function(d){ return d.y });

	node
		.append("text")
		.attr("x", function(d){
			if(d.parent)
				return (MARGIN / 2 + HOFFSET) * d.width;
			else
				return 0;
		})
		.attr("y", function(d){
				if(d.parent)
					return (1 + MARGIN / 2 + VOFFSET) * d.height;
				else
					return 0;
		})
		.text(labelfun)
		.attr("class", "label");

    // apply node positions
	node
		.append("title")
		.text(idfun);

	node.transition()
		 .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")"});


	var port = node.selectAll(".port")
	  .data(function(d) { return d.ports; })
	  .enter()
	  .append("rect")
	  .attr("class", "port")
    .attr("width", 2)
    .attr("height", 2)
  	.attr("x", 0)
  	.attr("y", 0)
	  .append("title")
	  .text(function(d) { return d.id; });

	  // apply edge routes
    link.transition().attr("d", function(d) {
      var path = "";
      path += "M" + d.sourcePoint.x + " " + d.sourcePoint.y + " ";
      d.bendPoints.forEach(function(bp, i) {
        path += "L" + bp.x + " " + bp.y + " ";
      });
      path += "L" + d.targetPoint.x + " " + d.targetPoint.y + " ";
      return path;
    });

    // apply node positions
    node.transition()
      .attr("transform", function(d) { return "translate(" + d.x + " " + d.y + ")"});

    // apply port positions
    port.transition()
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });

}

function measureSizeRec(obj)
{

	obj.width = 0;
	obj.height = 0;

	// save parent pointer
	obj.parent = parent;

	if(obj.children)
	{
		obj.children.forEach(function(child) { measureSizeRec(child, obj) })
	}
	else if(obj.name)
	{
		var dim = d3MeasureText(obj.name, "label")
		obj.width = (1 + MARGIN) * dim.width
		obj.height = (1 + MARGIN) * dim.height
	}

}

function redraw(svg)
{
  svg.attr("transform", "translate(" + d3.event.translate + ")"
                          + " scale(" + d3.event.scale + ")");
}
