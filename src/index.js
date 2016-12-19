var Render = require('./render')

/* Uncomment for automatic refresh */
//	document.getElementById('txtInput').onkeyup = update
//	document.getElementById('txtInput').onchange = update
//	window.onload = Update

document.getElementById('btnInput').onclick = () => displayGraphFromTextfield()

require('./tooltips')

if (document.getElementById('txtInput').value.length > 0) {
  displayGraphFromTextfield()
}

function displayGraphFromTextfield () {
  var actualGraph = JSON.parse(document.getElementById('txtInput').value)
  Render.renderGraph(actualGraph, 'svgOutput')
}
