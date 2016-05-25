/* global d3, d3MeasureText, $ */

/* Layout options */
const MARGIN = 1.0
const PORT_SIZE = 5.0

/* Uncomment for automatic refresh */
//	document.getElementById('txtInput').onkeyup = update
//	document.getElementById('txtInput').onchange = update
//	window.onload = Update

let actualGraph
let displayedGraph

document.getElementById('btnInput').onclick = () => {
  actualGraph = JSON.parse(document.getElementById('txtInput').value)
  displayedGraph = JSON.parse(document.getElementById('txtInput').value)
  displayGraph()
}

require('./tooltips')

/*
function viewport () {
  return {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
  }
}
*/

function displayGraph () {
  measureSizeRec(displayedGraph)
  doLayout(displayedGraph)
}

function doLayout (graph) {
  // const {width, height} = viewport()

  /* remove all svg elements */
  let allSvgs = document.querySelectorAll('svg')
  Array.prototype.forEach.call(allSvgs, (svg) => svg.parentNode.removeChild(svg))

  const {width, height} = d3.select('#tdOutput')

  let svg
  let zoom = d3.behavior.zoom()
    .on('zoom', () => {
      svg.select('g').attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`)
    })

  svg = d3.select('#tdOutput')
    .append('svg')
    .attr('id', 'svgOutput')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    .attr('xmlns:ev', 'http://www.w3.org/2001/xml-events')
    .attr('version', '1.1')
    .attr('baseprofile', 'full')
    .attr('width', width)
    .attr('height', height)
    .call(zoom)

  svg.html(`
  <defs>
    <marker id="markerArrow" markerWidth="3" markerHeight="3" refX="0.2" refY="1.5" orient="auto">
      <path d="M0,0 L0,3 L3,1.5 L0,0" style="fill: #333333;" />
    </marker>
  </defs>
  `)

  // group shizzle
  const root = svg

  setupRec(graph)

  const klay = require('klayjs')
  klay.layout({
    graph: graph,
    options: {
      spacing: 50,
      layoutHierarchy: true,
      direction: 'DOWN',
      edgeRouting: 'ORTHOGONAL',
      nodeLayering: 'NETWORK_SIMPLEX',
      nodePlace: 'BRANDES_KOEPF',
      fixedAlignment: 'NONE',
      crossMin: 'LAYER_SWEEP',
      algorithm: 'de.cau.cs.kieler.klay.layered'
    },
    success: (g) => layouter_Success(g, root),
    error: (g) => layouter_Error(g, root)
  })
}

function setupRec (graph) {
  let ports = graph.ports || []
  ports.forEach((p) => {
    p.width = PORT_SIZE
    p.height = PORT_SIZE
  })

  graph.padding = {
    left: 10,
    top: 20,
    right: 10,
    bottom: 10
  }

  // Layout adjustments, see http://rtsys.informatik.uni-kiel.de/confluence/display/KIELER/JSON+Graph+Format and
  // http://rtsys.informatik.uni-kiel.de/confluence/display/KIELER/KIML+Layout+Options for more information.
  /*
  graph.properties = Object.assign({}, graph.properties, {
    'de.cau.cs.kieler.portConstraints': 'FIXED_ORDER'
  })

  ;(graph.ports || []).forEach((port, i) => {
    port.properties = Object.assign({}, port.properties || {}, {
      'de.cau.cs.kieler.portSide': /.+_out/.test(port.id) ? 'SOUTH' : 'NORTH', // input nodes at north, output nodes at south
      'de.cau.cs.kieler.portIndex': i // port index is used for the order of ports
    })
  })
  */

  let children = graph.children || []
  children.forEach((c) => {
    setupRec(c)
  })
}

function layouter_Success (graph, root) {
  const width = Math.ceil(graph.width + ((graph.padding || {}).left || 0) + ((graph.padding || {}).right) || 0)
  const height = Math.ceil(graph.height) // the top/bottom padding is already included in the height
  root
    .attr('viewBox', `0 0 ${width} ${height}`)
  const rootList = root
    .selectAll('g')
    .data([graph])
    .enter()
    .append('g')

  buildGraph(rootList)
}

function layouter_Error (graph, root) {
  console.log(graph)
}

function getNode (id, graph = actualGraph) {
  if (graph.id === id) {
    return graph
  }

  const node = (graph.children || []).find((n) => n.id === id)
  if (node) {
    return node
  } else {
    for (let i = 0; i < (graph.children || []).length; i++) {
      const result = getNode(id, graph.children[i])
      if (result) {
        return result
      }
    }
  }
}

$(document).on('click', '.st-node-label.compound', function (event) {
  const node = getNode($(this).attr('data-id'), actualGraph)
  if (node.id !== 'root') {
    const displayedNode = getNode($(this).attr('data-id'), displayedGraph)

    if (node.children && !displayedNode.children) {
      displayedNode.children = JSON.parse(JSON.stringify(node.children))
      displayedNode.edges = node.edges ? JSON.parse(JSON.stringify(node.edges)) : undefined
    } else {
      delete displayedNode.children
      delete displayedNode.edges
    }
    // force re-layout
    delete displayedNode.width
    delete displayedNode.height
    delete displayedNode.textWidth
    delete displayedNode.textHeight
    delete displayedNode.x
    delete displayedNode.y
    displayGraph()
  }
})

function hasChildren (node) {
  node = getNode(node.id, actualGraph)
  return node.children && node.children.length > 0
}

function buildGraph (data, parent) {
  data
    .append('rect')
    .attr('class', (n) => `st-node ${hasChildren(n) ? 'compound' : 'atomic'}`) // 'st-node' because later uses of `selectAll('.node')` would behave bad if we use 'node'
    .attr('width', (n) => (n.width || 0) + (hasChildren(n) ? (n.padding ? n.padding.left + n.padding.right : 0) : 0))
    .attr('height', (n) => n.height || 0)
    .attr('data-id', (n) => n.id)
    .attr('data-meta', (n) => JSON.stringify(n.meta))
    .attr('stroke', '#000')
    .each(function (n) {
      if (hasChildren(n)) {
        d3.select(this)
          .attr('stroke-opacity', 0.5)
          .attr('stroke-dasharray', '10 5')
          .attr('fill-opacity', 0)
      } else {
        d3.select(this)
          .attr('stroke-width', '3px')
          .attr('fill', '#fff')
      }
    })

  data
    .filter((n) => n.text)
    .append('text')
    .text((n) => n.text)
    .attr('class', (n) => `st-node-label ${hasChildren(n) ? 'compound' : 'atomic'}`)
    .attr('x', (n) => hasChildren(n) ? 5 : (n.width - n.textWidth) / 2)
    .attr('y', (n) => hasChildren(n) ? n.textHeight : (n.height + n.textHeight) / 2)
    .attr('data-id', (n) => n.id)
    .attr('data-meta', (n) => JSON.stringify(n.meta))
    .attr('font-family', 'sans-serif')
    .attr('font-size', 14)
    .each(function (n) {
      if (hasChildren(n)) {
        d3.select(this)
          .attr('opacity', 0.5)
      }
    })

  data.selectAll('.port')
    .data((n) => (n.ports || []).map((p) => Object.assign({parent: n}, p)))
    .enter()
    .append('rect')
    .attr('class', (p) => `st-port ${/.+_out/.test(p.id) ? 'out' : 'in'}`) // 'st-port' because later uses of `selectAll('.port')` would behave bad if we use 'port'
    .attr('x', (p) => p.x || 0)
    .attr('y', (p) => p.y || 0)
    .attr('width', (p) => p.width || 0)
    .attr('height', (p) => p.height || 0)
    .attr('data-meta', (p) => JSON.stringify(p.meta))
    .attr('stroke', '#000')
    .each(function (p) {
      if (/.+_out/.test(p.id)) {
        d3.select(this)
          .attr('fill', 'darkred')
      } else {
        d3.select(this)
          .attr('fill', 'green')
      }
    })

  var nodeData = data
    .selectAll('.node')
    .data((n) => n.children || [])
    .enter()
    .append('g')
    .attr('transform', (n) => `translate(${n.x + (n.padding ? n.padding.left : 0)} ${n.y + (n.padding ? n.padding.top : 0)})`)

  if (!nodeData.empty()) {
    buildGraph(nodeData, data)
  }

  if (parent) {
    parent.selectAll('.link')
      .data((n) => (n.edges || []).map((e) => Object.assign({parent: n}, e)))
      .enter()
      .insert('path', ':nth-child(2)')
      .attr('class', 'st-link')
      .attr('stroke', '#333')
      .attr('stroke-width', '3px')
      .attr('opacity', 0.8)
      .attr('marker-end', 'url(#markerArrow)')
      .attr('fill', 'none')
      .attr('d', (e) => {
        const paddingLeft = e.parent.padding ? (e.parent.padding.left || 0) : 0
        const paddingTop = e.parent.padding ? (e.parent.padding.top || 0) : 0

        let path
        if (e.source === e.parent.id) {
          path = `M ${e.sourcePoint.x} ${e.sourcePoint.y} `
        } else {
          path = `M ${e.sourcePoint.x + paddingLeft} ${e.sourcePoint.y + paddingTop} `
        }

        let bendPoints = e.bendPoints || []
        bendPoints.forEach((bp, i) => {
          path += `L ${bp.x + paddingLeft} ${bp.y + paddingTop} `
        })
        path += `L ${e.targetPoint.x + paddingLeft} ${e.targetPoint.y + paddingTop - 10} `
        return path
      })
      .attr('data-meta', (e) => JSON.stringify(e.meta))
  }
}

const calculateSize = require('calculate-size')
function measureSizeRec (node, parent) {
  // save parent pointer
  node.parent = parent

  if (node.children) {
    node.children.forEach(function (child) { measureSizeRec(child, node) })
  }

  if (node.labels && node.labels.length > 0) {
    node.text = node.labels[0].text
    var dim = calculateSize(node.text, { fontSize: 14, font: 'Arial' })
    node.textWidth = dim.width
    node.textHeight = dim.height
    node.width = node.width || (1 + MARGIN) * dim.width
    node.height = node.height || (1 + MARGIN) * dim.height
  }
}
