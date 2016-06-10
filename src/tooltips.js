const $ = require('jquery')

const tooltip = $('<div class="tooltip"/>').appendTo('body')
function showTooltip (content, event) {
  tooltip.html(content).css({top: event.pageY, left: event.pageX + 20}).show()
}

$(document).on('mousemove', '.st-node.atomic, .st-node-label.atomic', function (event) {
  let meta = JSON.parse($(this).attr('data-meta'))
  showTooltip(`
    <table>
      <tr><td>Unique Name</td><td><code>${meta.branchPath}</code></td></tr>
      <tr><td>Component</td><td><code>${meta.id}</code> (atomic)</td></tr>
      <tr><td>Version</td><td>${meta.version}</td></tr>
      ${Object.keys(meta.inputPorts).length > 0 ? `<tr><td>Input ports</td>
        <td><ul>${Object.keys(meta.inputPorts).map((p) => `<li><code>${p}</code> (${meta.inputPorts[p]})</li>`).join('')}</ul></td></tr>` : ''}
      ${Object.keys(meta.outputPorts).length > 0 ? `<tr><td>Output ports</td>
        <td><ul>${Object.keys(meta.outputPorts).map((p) => `<li><code>${p}</code> (${meta.outputPorts[p]})</li>`).join('')}</ul></td></tr>` : ''}
      ${meta.params ? `<tr><td>Params</td><td><table>
        ${Object.keys(meta.params).map((p) => `<tr><td><code>${p}</code></td><td>${meta.params[p]}</td></tr>`)}
      <table></td></tr>` : ''}
    </table>
  `, event)
})

$(document).on('mousemove', '.st-node.compound, .st-node-label.compound', function (event) {
  let meta = $(this).attr('data-meta') ? JSON.parse($(this).attr('data-meta')) : null
  if (meta) { // compound nodes may not have meta data (i.e. the root node doesn't have meta data)
    showTooltip(`
    <table>
      <tr><td>Unique Name</td><td><code>${meta.branchPath}</code></td></tr>
      <tr><td>Component</td><td><code>${meta.id}</code> (compound)</td></tr>
      <tr><td>Version</td><td>${meta.version}</td></tr>
      ${Object.keys(meta.inputPorts).length > 0 ? `<tr><td>Input ports</td>
        <td><ul>${Object.keys(meta.inputPorts).map((p) => `<li><code>${p}</code> (${meta.inputPorts[p]})</li>`).join('')}</ul></td></tr>` : ''}
      ${Object.keys(meta.outputPorts).length > 0 ? `<tr><td>Output ports</td>
        <td><ul>${Object.keys(meta.outputPorts).map((p) => `<li><code>${p}</code> (${meta.outputPorts[p]})</li>`).join('')}</ul></td></tr>` : ''}
      ${meta.params ? `<tr><td>Params</td><td><table>
        ${Object.keys(meta.params).map((p) => `<tr><td><code>${p}</code></td><td>${meta.params[p]}</td></tr>`)}
      <table></td></tr>` : ''}
    </table>
  `, event)
  }
})

$(document).on('mousemove', '.st-port', function (event) {
  let meta = JSON.parse($(this).attr('data-meta'))
  // TODO add port name later
  showTooltip(`
    <table>
      <tr><td>Port</td><td>${meta.name}</td></tr>
      <tr><td>Type</td><td>${meta.type}</td></tr>
    </table>
  `, event)
})

$(document).on('mousemove', '.st-link', function (event) {
  let meta = JSON.parse($(this).attr('data-meta'))
  // TODO source and target nodes and ports later
  showTooltip(`
    <table>
      <tr><td>Link</td><td></td></tr>
      <tr><td>Source</td><td>${meta.sourceNode}@${meta.sourcePort}</td></tr>
      <tr><td>Source type</td><td>${(typeof (meta.sourceType) === 'object') ? JSON.stringify(meta.sourceType) : meta.sourceType}</td></tr>
      <tr><td>Target</td><td>${meta.targetNode}@${meta.targetPort}</td></tr>
      <tr><td>Target type</td><td>${(typeof (meta.targetType) === 'object') ? JSON.stringify(meta.targetType) : meta.targetType}</td></tr>
    </table>
  `, event)
})

$(document).on('mouseleave', '.st-node, .st-link, .st-node-label', () => tooltip.hide())
