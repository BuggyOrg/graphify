document.getElementById('btnInput').onclick = function()
{
	//document.body.appendChild(document.createElement("button"))
	Update()
}

function Update()
{
	var text = document.getElementById('txtInput').value
	var graph = JSON.parse(text)

	graph.children.forEach(measureSizeRec)

	console.log(text)

	var width = 0.5 * outerWidth;
	var height = 0.5 * outerHeight;

	layoutGraph(graph, width, height)
	function layoutGraph(graph, width, height, elementSelector)
	{

		var allSvgs = document.querySelectorAll("svg");
		[].forEach.call(allSvgs, function(svg) {
			svg.parentNode.removeChild(svg)
		})

		elementSelector = elementSelector || "body"
		 var svg = d3.select(elementSelector)
		  .append("svg")
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
			.attr("xmlns:ev", "http://www.w3.org/2001/xml-events")
			.attr("id", "svgOutput")
			.attr("version", "1.1")
			.attr("baseprofile", "full")
		  .attr("width", width + "mm")
		  .attr("height", height + "mm")
		  .append("g")

		// group shizzle
		var root = svg.append("g")

		var layouter = klay.d3kgraph()
		  .size([width, height])
		  .transformGroup(root)
		  .options({
		    edgeRouting: "ORTHOGONAL"
		  })

	  layouter.on("finish", _.partial(layouter_on_finish, layouter, root));

	  layouter.kgraph(graph)

		  //document.body.children[0].setAttribute("xmlns", "http://www.w3.org/2000/svg")
		  //document.body.children[0].innerHTML = fs.readFileSync(__dirname + '/template.html') + doc.body.children[0].innerHTML
		  //console.log(doc.body.innerHTML)

	}
}

//document.getElementById('btnInput').onclick = updateFn
document.getElementById('txtInput').onkeyup = Update
document.getElementById('txtInput').onchange = Update
window.onload = Update

function layouter_on_finish(layouter, root, d2)
{

		var nodes = layouter.nodes();
		var links = layouter.links(nodes);

		var idfun = function(d) { if(d.labels) return d.id; };
		var labelfun = function(d) { return d.children ? "" : (d.labels ? d.labels[0].text : "") };

		var linkData = root.selectAll(".link")
			.data(links, idfun);
		var link = linkData.enter()
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



		var nodeData = root.selectAll(".node")
			.data(nodes, idfun);
		var node = nodeData.enter()
			.append("g")
			.attr("class", function(d) {
					if (d.children) return "node compound"; else return "node leaf";
			});

		//var dim = d3MeasureText("rekt")
		//console.log(d.size)

		var atoms = node.append("rect")
			//.attr("width", function(d){ return d3MeasureText(d.id).width; })
			//.attr("height", function(d){ return d3MeasureText(d.id).height; })
			.attr("width", function(d){ return d.width; })
			.attr("height", function(d){ return d.height; })
			.attr("x", function(d){ return d.x })
			.attr("y", function(d){ return d.y })

		node.append("text")
				.attr("x", function(d){
					if(d.parent)
						return d.x + 0.25 * d.width;
					else
						return d.x;
				})
				.attr("y", function(d){
						if(d.parent)
							return d.y + 0.75 * d.height;
						else
							return d.y;
				})
				.text(labelfun)
				.attr("font-size", "4px");

		node.append("title")
			.text(idfun);

		// apply edge routes

		// apply node positions
	//  node.transition()
	//    .attr("transform", function(d) { return "translate(" + (d.x || 0) + " " + (d.y || 0) + ")"})

		//atoms.transition()
		//  .attr("width", function(d) { return d.width; })
		//  .attr("height", function(d) { return d.height; })

		//atoms.transition()
		//  .attr("width", function(d) { return 3 * d3MeasureText(d.id).width; })
		//  .attr("height", function(d) { return 3 * d3MeasureText(d.id).height; })


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
	else if(obj.labels)
	{
		obj.labels.forEach(function(label)
		{
			var dim = d3MeasureText(label.text)
			obj.width = Math.max(obj.width, 0.5 * dim.width)
			obj.height = Math.max(obj.height, 0.5 * dim.height)
		})
	}

}
