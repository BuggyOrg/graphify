var React = require('react')
var ReactDom = require('react-dom')
var GraphLayouter = require('@buggyorg/graphify-react').GraphLayouter

/* Uncomment for automatic refresh */
// document.getElementById('txtInput').onkeyup = update
// document.getElementById('txtInput').onchange = update
// window.onload = Update

window.init = function () {
  document.getElementById('btnInput').onclick = () => displayGraphFromTextfield()

  require('./tooltips')

  if (window.getEditorContent().length > 0) {
    displayGraphFromTextfield()
  }

  function displayGraphFromTextfield () {
    var actualGraph = JSON.parse(window.getEditorContent())
    ReactDom.render(React.createElement(GraphLayouter, { kgraph: actualGraph }), document.getElementById('tdOutput'))
  }
}
