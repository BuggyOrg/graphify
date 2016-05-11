/* global d3, d3MeasureText */

/* Layout options */
const MARGIN = 1.0
const PORT_SIZE = 5.0

/* Uncomment for automatic refresh */
//	document.getElementById('txtInput').onkeyup = update
//	document.getElementById('txtInput').onchange = update
//	window.onload = Update

document.getElementById('btnInput').onclick = update

require('./tooltips')

/*
function viewport () {
  return {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
  }
}
*/

function update () {
  /* read graph input */
  let text = document.getElementById('txtInput').value
  let graph = JSON.parse(text)

  /*
  const addPadding = (node) => {
    ;(node.children || []).forEach((n) => addPadding(n))
    node.padding = {
      top: 200
    }
  }
  addPadding(graph)
  */

  /* measure size of leaf boxes */
  measureSizeRec(graph)

  doLayout(graph)
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

  let children = graph.children || []
  if (children.length > 0) {
    graph.padding = {
      left: 10,
      top: 20,
      right: 10,
      bottom: 10
    }
  }
  children.forEach((c) => {
    setupRec(c)
  })
}

function layouter_Success (graph, root) {
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

function buildGraph (data, parent) {
  data
    .append('rect')
    .attr('class', (n) => `st-node ${(n.children || []).length > 0 ? 'compound' : 'atomic'}`) // 'st-node' because later uses of `selectAll('.node')` would behave bad if we use 'node'
    .attr('width', (n) => (n.width || 0) + ((n.children || []).length > 0 ? (n.padding ? n.padding.left + n.padding.right : 0) : 0))
    .attr('height', (n) => n.height || 0)
    .attr('data-meta', (n) => JSON.stringify(n.meta))

  data
    .filter((n) => n.text)
    .append('text')
    .text((n) => n.text)
    .attr('class', (n) => `st-node-label ${(n.children || []).length > 0 ? 'compound' : 'atomic'}`)
    .attr('x', (n) => (n.children || []).length > 0 ? 5 : (n.width - n.textWidth) / 2)
    .attr('y', (n) => n.children ? n.textHeight : (n.height + n.textHeight) / 2)
    .attr('width', (n) => n.textWidth)
    .attr('height', (n) => n.textHeight)
    .attr('data-meta', (n) => JSON.stringify(n.meta))

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
      .attr('marker-end', 'url(#markerArrow)')
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

function measureSizeRec (node, parent) {
  // save parent pointer
  node.parent = parent

  if (node.children) {
    node.children.forEach(function (child) { measureSizeRec(child, node) })
  }

  if (node.labels && node.labels.length > 0) {
    node.text = node.labels[0].text
    var dim = d3MeasureText(node.text, 'label')
    node.textWidth = dim.width
    node.textHeight = dim.height
    node.width = node.width || (1 + MARGIN) * dim.width
    node.height = node.height || (1 + MARGIN) * dim.height
  }
}
