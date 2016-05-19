var Nightmare = require('nightmare')
var path = require('path')

var graphifyPath = path.normalize(path.join(__dirname, '../'))

module.exports = (input) => {
  /* Nightmare Options */
  var nightmare = Nightmare({
    plugins: true,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true
  })
  /* Open page in nightmare and read svg result */

  return Promise.resolve(nightmare
    .goto(path.join('file://', graphifyPath, 'app/index.html'))
    .type('#txtInput', input)
    .click('#btnInput')
    .wait('#svgOutput')
    .evaluate(function () {
      var svg = document.getElementById('svgOutput')
      svg.removeAttribute('baseprofile')
      svg.removeAttribute('id')
      Array.prototype.forEach.call(svg.querySelectorAll('*'), (e) => {
        e.removeAttribute('data-meta')
        e.removeAttribute('class')
      })
      return svg.outerHTML
    })
    .end())
    .then((svg) => {
      var result =
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
        svg
      return result
    })
}
