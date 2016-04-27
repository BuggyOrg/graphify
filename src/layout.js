
/* Layout options */
var MARGIN = 1.0
var PORT_SIZE = 5.0

/* Uncomment for automatic refresh */
//	document.getElementById('txtInput').onkeyup = update
//	document.getElementById('txtInput').onchange = update
//	window.onload = Update

document.getElementById('btnInput').onclick = update

function viewport () {
	var e = window, a = 'inner'
	if (!('innerWidth' in window)) {
		a = 'client'
		e = document.documentElement || document.body
	}
	return {
		width: e[a + 'Width'],
		height: e[a + 'Height']
	}
}

function update () {
	/* read graph input */
	var text = document.getElementById('txtInput').value
	var graph = JSON.parse(text)

	/* measure size of leaf boxes */
	measureSizeRec(graph)

	doLayout(graph)
}

function doLayout (graph){
	var width = viewport().width;
	var height = viewport().height;

	/* remove all svg elements */
	var allSvgs = document.querySelectorAll("svg");
	[].forEach.call(allSvgs, function(svg) {
		svg.parentNode.removeChild(svg)
	})

	width = d3.select("#tdOutput").width
	height = d3.select("#tdOutput").height

	var svg;
	var zoom = d3.behavior.zoom()
	    .on("zoom", function() {			
			svg.select('g').attr("transform", `translate(${d3.event.translate}) scale(${d3.event.scale})`);
		})
						 
	svg = d3.select("#tdOutput")
		.append("svg")
		.attr("id", "svgOutput")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
		.attr("xmlns:ev", "http://www.w3.org/2001/xml-events")
		.attr("version", "1.1")
		.attr("baseprofile", "full")
		.attr("width", width)
		.attr("height", height)
    	.call(zoom)

	// group shizzle
	var root = svg

	var klay = require("klayjs")

	setupRec(graph)

	klay.layout({
	  graph: graph,
	  options: {
			spacing: 50,
	    layoutHierarchy: true,
	    direction: "RIGHT",
	    edgeRouting: "ORTHOGONAL",
	    nodeLayering: "NETWORK_SIMPLEX",
	    nodePlace: "BRANDES_KOEPF",
	    fixedAlignment: "NONE",
	    crossMin: "LAYER_SWEEP",
	    algorithm: "de.cau.cs.kieler.klay.layered"
		},
	  success: (g) => layouter_Success(g, root),
	  error: (g) => layouter_Error(g, root),
	})

}

function setupRec(graph) {

	(graph.ports || []).forEach(p => {
		p.width = PORT_SIZE
		p.height = PORT_SIZE
	});

	(graph.children || []).forEach(c => {
		setupRec(c)
	});

}

function layouter_Success(graph, root)
{

	var rootList = root
		.selectAll('g')
		.data([graph])
    .enter()
		.append('g');

	buildGraph(rootList, graph)

}

function layouter_Error(graph, root)
{
	console.log(graph)
}

function buildGraph(data)
{
	    var nodeData = data
			.selectAll(".node")
			.data(n => n.children || [])
			  .enter()
			  .append("g")
			  .attr("transform", n => "translate(" + (n.x || 0) + " " + (n.y || 0) + ")")
			  
	data
			.append("rect")
		    .attr("class", n => `node ${(n.children || []).length > 0 ? 'compound' : ''}`)
			.attr("width", n => n.width || 0)
			.attr("height", n => n.height || 0);
			
	data
		.filter(n => n.text)
		.append("text")
		.text(n => n.text)
		.attr("x", n => (n.width - n.textWidth) / 2)
		.attr("y", n => n.children ? n.textHeight : (n.height + n.textHeight) / 2)
		.attr("width", n => n.textWidth )
		.attr("height", n => n.textHeight);
			
	data
		.selectAll(".link")
		.data(n => n.edges || [])
		.enter()
		.append("path")
		.attr("class", "link")
		.attr("d", e => {
      var path = "";
      path += "M" + e.sourcePoint.x + " " + e.sourcePoint.y + " ";
        (e.bendPoints || []).forEach(function(bp, i) {
          path += "L" + bp.x + " " + bp.y + " ";
        });
      path += "L" + e.targetPoint.x + " " + e.targetPoint.y + " ";
      return path;
    });

		data
			.selectAll(".port")
		  .data(n => n.ports || [])
		  .enter()
		  .append("rect")
		  .attr("class", p => `port ${/.+_out/.test(p.id) ? 'out' : 'in'}`)
	  	.attr("x", p => p.x || 0)
	  	.attr("y", p => p.y || 0)
			.attr("width", p => p.width || 0)
			.attr("height", p => p.height || 0)
			
		if(!nodeData.empty())
			buildGraph(nodeData)
}

function measureSizeRec(node, parent)
{

	// save parent pointer
	node.parent = parent;

	if(node.children)
	{
		node.children.forEach(function(child) { measureSizeRec(child, node) })
	}

	if(node.labels && node.labels.length > 0)
	{
		node.text = node.labels[0].text
		var dim = d3MeasureText(node.text, "label")
		node.textWidth = dim.width
		node.textHeight = dim.height
		node.width = node.width || (1 + MARGIN) * dim.width
		node.height = node.height || (1 + MARGIN) * dim.height
	}

}
