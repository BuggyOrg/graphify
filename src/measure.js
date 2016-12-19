const calculateSize = require('calculate-size')
window.measureText = (text, style) => {
  if (Array.isArray(text)) {
    return text.map((t) => calculateSize.default(t, style))
  } else {
    return calculateSize.default(text, style)
  }
}
