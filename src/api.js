
var Nightmare = require('nightmare')
var fs = require('fs')
var vo = require('vo')
var path = require('path')
require("babel-polyfill")

module.exports = function(input, cssFile = 'src/style.css') {
  var graphifyPath = path.normalize(path.join(__dirname, '../'))
  var cssPath = path.join(graphifyPath, cssFile)
  var css = fs.readFileSync(cssPath, 'utf8')

  return new Promise((resolve, reject) => {
    vo(function* () {

    /* Nightmare Options */
    var nightmare = Nightmare(
    {
      plugins: true,
      allowDisplayingInsecureContent: true,
      allowRunningInsecureContent: true
    })

    /* Open page in nightmare and read svg result */
    var result = yield nightmare
      .goto(path.join('file://', graphifyPath, 'app/index.html'))
      .type('#txtInput', input)
      .click('#btnInput')
      .wait('#svgOutput')
      .wait(1000)
      .evaluate(function(css) {
        var svg = document.getElementById('svgOutput')
        svg.innerHTML = "<style> /* <![CDATA[ */" + css + "/* ]]> */ </style>" + svg.innerHTML
        return svg.outerHTML
      }, css)
      yield nightmare.end()
      resolve(result)

    })(function (err, result)
    {
      reject(err);
    });
  })
}