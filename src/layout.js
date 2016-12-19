const calculateSize = require('calculate-size')
// const $ = require('jquery')
const klay = require('klayjs')

const defaultOptions = {
  marginX: 10.0,
  marginY: 8.0,
  portSize: 5.0,
  spacing: 50,
  fontSize: 14,
  font: 'sans-serif'
}

// export measuring. Only get the sizes of the components
window.measureGraph = (graph, options) => {
  options = Object.assign(defaultOptions, options)
  measureSizes(graph, options)
}

// export layouting. Do everything
window.layoutGraph = (graph, options) => {
  options = Object.assign(defaultOptions, options)
  return new Promise((resolve, reject) =>
    doLayout(measureSizes(graph, options), options, resolve, reject)
  )
}

function measureSizes (graph, options) {
  getNodes(graph).forEach((n) => layoutNode(n, options))

  getPorts(graph).forEach((p) => {
    p.width = options.portSize
    p.height = options.portSize
  })

  return graph
}

function doLayout (graph, options, success, error) {
  klay.layout({
    graph: graph,
    options: {
      spacing: options.spacing,
      layoutHierarchy: true,
      direction: 'DOWN',
      edgeRouting: 'ORTHOGONAL',
      nodeLayering: 'NETWORK_SIMPLEX',
      nodePlace: 'BRANDES_KOEPF',
      fixedAlignment: 'NONE',
      crossMin: 'LAYER_SWEEP',
      algorithm: 'de.cau.cs.kieler.klay.layered'
    },
    success,
    error
  })
}

function flatten (a) {
  return [].concat.apply([], a)
}

function getDeep (graph, property, fn) {
  return (graph[property] || []).concat(flatten((graph.children || []).map((c) => getDeep(c, property))))
}

function getPorts (graph) {
  return getDeep(graph, 'ports')
}

function getNodes (graph) {
  return getDeep(graph, 'children').concat([graph])
}

function layoutNode (node, options) {
  if (node.labels && node.labels.length > 0) {
    node.text = node.labels[0].text
    var dim = calculateSize.default(node.text, options)
    node.textWidth = dim.width
    node.textHeight = dim.height
    node.width = node.width || dim.width + 2 * options.marginX
    node.height = node.height || dim.height + 2 * options.marginY
  }

  node.padding = {
    left: 10,
    top: 20,
    right: 10,
    bottom: 10
  }
}

module.exports = {
  layoutGraph: window.layoutGraph
}
