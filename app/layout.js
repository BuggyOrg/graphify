(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var MARGIN = 0.5;
var HOFFSET = -0.1;
var VOFFSET = -0.6;

/* Uncomment for automatic refresh */
//document.getElementById('txtInput').onkeyup = Update
//document.getElementById('txtInput').onchange = Update
//window.onload = Update

document.getElementById('btnInput').onclick = Update;

function viewport() {
	var e = window,
	    a = 'inner';
	if (!('innerWidth' in window)) {
		a = 'client';
		e = document.documentElement || document.body;
	}
	return {
		width: e[a + 'Width'],
		height: e[a + 'Height']
	};
}

function Update() {

	/* read graph input */
	var text = document.getElementById('txtInput').value;
	var graph = JSON.parse(text);

	if (!graph.nodes) return;

	/* measure size of leaf boxes */
	graph.nodes.forEach(measureSizeRec);

	var width = viewport().width;
	var height = viewport().height;

	layoutGraph(graph, width, height);
}

function layoutGraph(graph, width, height) {

	/* remove all svg elements */
	var allSvgs = document.querySelectorAll("svg");
	[].forEach.call(allSvgs, function (svg) {
		svg.parentNode.removeChild(svg);
	});

	var zoom = d3.behavior.zoom().on("zoom", function () {
		redraw(svg);
	});

	width = d3.select("#tdOutput").width;
	height = d3.select("#tdOutput").height;

	var svg = d3.select("#tdOutput").append("svg").attr("id", "svgOutput").attr("xmlns", "http://www.w3.org/2000/svg").attr("xmlns:xlink", "http://www.w3.org/1999/xlink").attr("xmlns:ev", "http://www.w3.org/2001/xml-events").attr("version", "1.1").attr("baseprofile", "full").attr("width", width).attr("height", height).call(zoom).append("g");

	// group shizzle
	var root = svg.append("g");

	var layouter = klay.d3adapter();

	layouter.nodes(graph.nodes).links(graph.links).size([width, height]).transformGroup(root).options({
		edgeRouting: "ORTHOGONAL",
		intCoordinates: false
	}).defaultPortSize([2, 2]);

	var idfun = function idfun(d) {
		return d.id;
	};
	var labelfun = function labelfun(d) {
		return d.children ? "" : d.name || "";
	};

	var link = root.selectAll(".link").data(graph.links).enter().append("path").attr("class", "link").attr("d", "M0 0");

	var node = root.selectAll(".node").data(graph.nodes).enter().append("g");

	node.append("rect").attr("class", "node").attr("width", function (d) {
		return d.width || 0;
	}).attr("height", function (d) {
		return d.height || 0;
	}).attr("x", 0).attr("y", 0);

	node.append("title").text(function (d) {
		return d.name;
	});

	node.append("text").attr("x", function (d) {
		if (d.parent) return (MARGIN / 2 + HOFFSET) * d.width;else return 0;
	}).attr("y", function (d) {
		if (d.parent) return (1 + MARGIN / 2 + VOFFSET) * d.height;else return 0;
	}).text(labelfun).attr("class", "label");

	var port = node.selectAll(".port").data(function (d) {
		return d.ports;
	}).enter().append("rect").attr("class", "port").attr("width", 2).attr("height", 2).attr("x", 0).attr("y", 0);

	port.append("title").text(function (d) {
		return d.id;
	});

	layouter.on("finish", function () {
		layouter_on_finish(layouter, node, link, port);
	}).start();
}

function layouter_on_finish(layouter, node, link, port) {

	// apply edge routes
	link.transition().attr("d", function (d) {
		var path = "";
		path += "M" + d.sourcePoint.x + " " + d.sourcePoint.y + " ";
		d.bendPoints.forEach(function (bp, i) {
			path += "L" + bp.x + " " + bp.y + " ";
		});
		path += "L" + d.targetPoint.x + " " + d.targetPoint.y + " ";
		return path;
	});

	// apply node positions
	node.transition().attr("transform", function (d) {
		return "translate(" + d.x + " " + d.y + ")";
	});

	// apply port positions
	port.transition().attr("x", function (d) {
		return d.x;
	}).attr("y", function (d) {
		return d.y;
	});
}

function measureSizeRec(obj) {

	obj.width = 0;
	obj.height = 0;

	// save parent pointer
	obj.parent = parent;

	if (obj.children) {
		obj.children.forEach(function (child) {
			measureSizeRec(child, obj);
		});
	} else if (obj.name) {
		var dim = d3MeasureText(obj.name, "label");
		obj.width = (1 + MARGIN) * dim.width;
		obj.height = (1 + MARGIN) * dim.height;
	}
}

function redraw(svg) {
	svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

},{}]},{},[1])


//# sourceMappingURL=layout.js.map
