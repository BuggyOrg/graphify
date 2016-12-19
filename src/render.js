const d3 = require('d3')
// const $ = require('jquery')
const Layout = require('./layout.js')
const Graph = require('./graph')

function extractSvg (element) {
  var svg = document.getElementById(element)
  svg.removeAttribute('baseprofile')
  svg.removeAttribute('id')
  Array.prototype.forEach.call(svg.querySelectorAll('*'), (e) => {
    e.removeAttribute('data-meta')
    e.removeAttribute('data-id')
    e.removeAttribute('class')
  })
  return svg.outerHTML
}

window.renderGraph = (graph, element) => {
  element = element || 'svgOutput'
  return Layout.layoutGraph(graph)
  .then((layoutedGraph) => {
    layouterSuccess(graph, 'svgOutput')
    return extractSvg('svgOutput')
  })
  .catch((error) => {
    console.error(error)
  })
}

module.exports = {
  renderGraph: window.renderGraph
}

function removeOldSvgs () {
  /* remove all svg elements, perhaps a bit  */
  let allSvgs = document.querySelectorAll('svg')
  Array.prototype.forEach.call(allSvgs, (svg) => svg.parentNode.removeChild(svg))
}

function createSvgRoot (element, width, height) {
  let svg
  let zoom = d3.behavior.zoom()
    .on('zoom', () => {
      svg.select('g').attr('transform', `translate(${d3.event.translate}) scale(${d3.event.scale})`)
    })

  svg = d3.select('#tdOutput')
    .append('svg')
    .attr('id', element)
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    .attr('xmlns:ev', 'http://www.w3.org/2001/xml-events')
    .attr('version', '1.1')
    .attr('baseprofile', 'full')
    .attr('width', width)
    .attr('height', height)
    .call(zoom)
    .attr('viewBox', `0 0 ${width} ${height}`)
  return svg
}

function getLineColor (edge) {
  return (edge.meta && edge.meta.style) ? (edge.meta.style.color || '#333333') : '#333333'
}

function getLineColors (graph) {
  return Graph.getEdges(graph).map(getLineColor)
  // return $.uniqueSort(Graph.edges(graph).map(getLineColor))
}

function colorMarkerName (color) {
  return `marker-${color}`
}

function addColorMarker (color, root) {
  if (root.select('defs').empty()) {
    root.append('defs')
  }
  root.select('defs').append('marker')
    .attr('id', colorMarkerName(color))
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('refX', 0.2)
    .attr('refY', 1.5)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,0 L0,3 L3,1.5 L0,0')
    .attr('fill', color)
}

function layouterSuccess (graph, element) {
  const width = Math.ceil(graph.width + ((graph.padding || {}).left || 0) + ((graph.padding || {}).right) || 0)
  const height = Math.ceil(graph.height) // the top/bottom padding is already included in the height

  removeOldSvgs()
  var root = createSvgRoot(element, width, height)
  var colors = getLineColors(graph)
  colors.map((c) => addColorMarker(c, root))

  const rootList = root
    .selectAll('g')
    .data([graph])
    .enter()
    .append('g')

  buildGraph(rootList, graph)
}

function buildGraph (data, graph) {
  data
    .append('rect')
    .attr('class', (n) => `st-node ${Graph.isCompound(n, graph) ? 'compound' : 'atomic'}`) // 'st-node' because later uses of `selectAll('.node')` would behave bad if we use 'node'
    .attr('width', (n) => (n.width || 0) + (Graph.isCompound(n, graph) ? (n.padding ? n.padding.left + n.padding.right : 0) - 1 : 0))
    .attr('height', (n) => Graph.isCompound(n, graph) ? (n.height || 0) - 1 : (n.height || 0))
    .attr('data-id', (n) => n.id)
    .attr('data-meta', (n) => JSON.stringify(n.meta))
    .attr('stroke', '#000')
    .each(function (n) {
      const node = d3.select(this)
      if (n.meta && n.meta.style) {
        if (n.meta.style.color) {
          node.attr('stroke', n.meta.style.color)
        }
      }

      if (Graph.isCompound(n, graph)) {
        node
          .attr('stroke-opacity', 0.5)
          .attr('stroke-dasharray', '10 5')
          .attr('fill-opacity', 0)
          .attr('transform', 'translate(0.5 0.5)')
      } else {
        node
          .attr('stroke-width', '3px')
          .attr('fill', '#fff')
      }
    })

  data
    .filter((n) => n.text)
    .append('text')
    .text((n) => n.text)
    .attr('class', (n) => `st-node-label ${Graph.isCompound(n, graph) ? 'compound' : 'atomic'}`)
    .attr('x', (n) => Graph.isCompound(n, graph) ? 5 : (n.width - n.textWidth) / 2)
    .attr('y', (n) => Graph.isCompound(n, graph) ? n.textHeight : (n.height + n.textHeight) / 2)
    .attr('data-id', (n) => n.id)
    .attr('data-meta', (n) => JSON.stringify(n.meta))
    .attr('font-family', 'sans-serif')
    .attr('font-size', 14)
    .each(function (n) {
      const node = d3.select(this)
      if (n.meta && n.meta.style) {
        if (n.meta.style.color) {
          node.attr('fill', n.meta.style.color)
        }
      }

      if (Graph.isCompound(n, graph)) {
        node
          .attr('opacity', 0.5)
      }
    })

  data.selectAll('.port')
    .data((n) => (n.ports || []).map((p) => Object.assign({parent: n}, p)))
    .enter()
    .append('rect')
    .attr('class', (p) => `st-port ${/.+_out$/.test(p.id) ? 'out' : 'in'}`) // 'st-port' because later uses of `selectAll('.port')` would behave bad if we use 'port'
    .attr('x', (p) => p.x || 0)
    .attr('y', (p) => p.y || 0)
    .attr('width', (p) => p.width || 0)
    .attr('height', (p) => p.height || 0)
    .attr('data-meta', (p) => JSON.stringify(p.meta))
    .attr('stroke', '#000')
    .each(function (p) {
      if (/.+_out$/.test(p.id)) {
        d3.select(this)
          .attr('fill', 'black')
      } else {
        d3.select(this)
          .attr('fill', 'white')
      }
    })

  var nodeData = data
    .selectAll('.node')
    .data((n) => n.children || [])
    .enter()
    .append('g')
    .attr('transform', (n) => `translate(${n.x + (n.padding ? n.padding.left : 0)} ${n.y + (n.padding ? n.padding.top : 0)})`)

  if (!nodeData.empty()) {
    buildGraph(nodeData, graph)
  }

  data.selectAll('.link')
   .data((n) => (n.edges || []).map((e) => Object.assign({parent: n}, e)))
   .enter()
   .insert('path', ':nth-child(2)')
   .attr('class', 'st-link')
   .attr('stroke', '#333')
   .attr('stroke-width', '3px')
   .attr('opacity', 0.8)
   .attr('marker-end', (e) => `url(#${colorMarkerName(getLineColor(e))})`)
   .attr('fill', 'none')
   .attr('d', (e) => {
     const paddingLeft = e.parent.padding && e.source !== e.target ? (e.parent.padding.left || 0) : 0
     const paddingTop = e.parent.padding && e.source !== e.target ? (e.parent.padding.top || 0) : 0
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
   .each(function (e) {
     const edge = d3.select(this)
     edge.attr('stroke', getLineColor(e))
     if (e.source === e.target) {
       edge.attr('transform', `translate(${-e.parent.x} ${-e.parent.y})`)
     }
   })
}

// function setupRec (graph) {
//   // Layout adjustments, see http://rtsys.informatik.uni-kiel.de/confluence/display/KIELER/JSON+Graph+Format and
//   // http://rtsys.informatik.uni-kiel.de/confluence/display/KIELER/KIML+Layout+Options for more information.
//   /*
//   graph.properties = Object.assign({}, graph.properties, {
//     'de.cau.cs.kieler.portConstraints': 'FIXED_ORDER'
//   })

//   ;(graph.ports || []).forEach((port, i) => {
//     port.properties = Object.assign({}, port.properties || {}, {
//       'de.cau.cs.kieler.portSide': /.+_out$/.test(port.id) ? 'SOUTH' : 'NORTH', // input nodes at north, output nodes at south
//       'de.cau.cs.kieler.portIndex': i // port index is used for the order of ports
//     })
//   })
//   */

//   /* activate hide / show
//   $(document).on('click', '.st-node-label.compound', function (event) {
//     const node = getNode($(this).attr('data-id'), graph)
//     if (node.id !== 'root') {
//       const displayedNode = getNode($(this).attr('data-id'), window.displayedGraph)

//       if (node.children && !displayedNode.children) {
//         displayedNode.children = JSON.parse(JSON.stringify(node.children))
//         displayedNode.edges = node.edges ? JSON.parse(JSON.stringify(node.edges)) : undefined
//       } else {
//         delete displayedNode.children
//         delete displayedNode.edges
//       }
//       // force re-layout
//       delete displayedNode.width
//       delete displayedNode.height
//       delete displayedNode.textWidth
//       delete displayedNode.textHeight
//       delete displayedNode.x
//       delete displayedNode.y
//       displayGraph()
//     }
//   }) */
// }
