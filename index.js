/* globals d3, klayjs, process */
d3 = require('d3')
var d3MeasureText = require('d3-measure-text')
d3MeasureText.d3 = d3
klayjs = require('klayjs')
var jsdom = require('jsdom')
var klay = require("klayjs-d3/src/js/klay-d3.js")
var serializeDocument = jsdom.serializeDocument
var fs = require('fs')
var doc = jsdom.jsdom()
var rte = require('readtoend')

function viewport() {
  var a = 'inner'
  var e = document.body;
  return {
    width: e[a + 'Width'],
    height: e[a + 'Height']
  }
}

var width = 600
var height = 600
var idfun = function(d) { return d.id }    

var svg = d3.select(doc.body)
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")

// group shizzle
var root = svg.append("g")

var layouter = klay.d3kgraph()
  .size([width, height])
  .transformGroup(root)
  .options({
    edgeRouting: "ORTHOGONAL"
  })

// load the data and render the elements
rte.readToEnd(process.stdin, function(err,graphStr){
  if(err){
    console.error(err)
    return
  }
  var graph = JSON.parse(graphStr)
  graph.children.forEach(function(c){
     var dim = d3MeasureText(c.labels[0].text)
     console.log("Measure of : '" + c.labels[0].text + "' is " + dim)
  })
  
  layouter.on("finish", function(d) {
    var nodes = layouter.nodes();
    var links = layouter.links(nodes);
    
    var linkData = root.selectAll(".link")
      .data(links, idfun);
    var link = linkData.enter()
      .append("path")
      .attr("class", "link")
      .attr("d", "M0 0");
    
    var nodeData = root.selectAll(".node")
      .data(nodes, idfun);
    var node = nodeData.enter()
      .append("g")
      .attr("class", function(d) { 
          if (d.children) return "node compound"; else return "node leaf"; 
      });
        
    var atoms = node.append("rect")
      .attr("width", function(d){ return d.width; })
      .attr("height", function(d){ return d.height; })
      .attr("x", function(d){ return d.x })
      .attr("y", function(d){ return d.y })
    
    node.append("title")
      .text(function(d) { return d.id; });  
        
    // apply edge routes
    link.transition().attr("d", function(d) {
      var path = "";
      path += "M" + d.sourcePoint.x + " " + d.sourcePoint.y + " ";
      (d.bendPoints || []).forEach(function(bp, i) {
          path += "L" + bp.x + " " + bp.y + " ";
      });
      path += "L" + d.targetPoint.x + " " + d.targetPoint.y + " ";
      return path;
    });
  
    // apply node positions
  //  node.transition()
  //    .attr("transform", function(d) { return "translate(" + (d.x || 0) + " " + (d.y || 0) + ")"})
    
    atoms.transition()
      .attr("width", function(d) { return d.width; })
      .attr("height", function(d) { return d.height; })
  });
  
  layouter.kgraph(graph)
  doc.body.children[0].setAttribute("xmlns", "http://www.w3.org/2000/svg")
  doc.body.children[0].innerHTML = fs.readFileSync(__dirname + '/template.html') + doc.body.children[0].innerHTML
  console.log(doc.body.innerHTML)
  
})