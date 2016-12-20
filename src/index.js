var Render = require('./render')

/* Uncomment for automatic refresh */
//	document.getElementById('txtInput').onkeyup = update
//	document.getElementById('txtInput').onchange = update
//	window.onload = Update

window.init = function () {
  document.getElementById('btnInput').onclick = () => displayGraphFromTextfield()

  require('./tooltips')

  if (window.getEditorContent().length > 0) {
    displayGraphFromTextfield()
  }

  function displayGraphFromTextfield () {
    var actualGraph = JSON.parse(window.getEditorContent())
    Render.renderGraph(actualGraph, 'svgOutput')
  }
}
