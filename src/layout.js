const calculateSize = require('calculate-size')
const graphify = require('graphify-node')

/*
const defaultOptions = {
  measure: {
    marginX: 10.0,
    marginY: 8.0,
    portSize: 5.0,
    fontSize: 14,
    font: 'sans-serif',
    padding: {
      left: 10,
      top: 20,
      right: 10,
      bottom: 10
    }
  },
  klay: {
    spacing: 50,
    layoutHierarchy: true,
    direction: 'DOWN',
    edgeRouting: 'ORTHOGONAL',
    nodeLayering: 'NETWORK_SIMPLEX',
    nodePlace: 'BRANDES_KOEPF',
    fixedAlignment: 'NONE',
    crossMin: 'LAYER_SWEEP',
    algorithm: 'de.cau.cs.kieler.klay.layered'
  }
}
*/

// export layouting. Do everything
window.layoutGraph = (graph, options) => {
  return graphify.layout(graph, calculateSize.default, options)
}

module.exports = {
  layoutGraph: window.layoutGraph
}
