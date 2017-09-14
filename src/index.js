var React = require('react')
var ReactDom = require('react-dom')
var GraphViewer = require('@buggyorg/graphify-react').GraphViewer

/* Uncomment for automatic refresh */
// document.getElementById('txtInput').onkeyup = update
// document.getElementById('txtInput').onchange = update
// window.onload = Update

window.init = function () {
  document.getElementById('btnInput').onclick = () => displayGraphFromTextfield()

  if (window.getEditorContent().length > 0) {
    displayGraphFromTextfield()
  }

  function displayGraphFromTextfield () {
    var actualGraph = JSON.parse(window.getEditorContent())
    ReactDom.render(React.createElement(GraphViewer, { kgraph: actualGraph }), document.getElementById('tdOutput'))
  }
}
