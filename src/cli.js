var Nightmare = require('nightmare')
var fs = require('fs')
var vo = require('vo')

// cli arguments and defaults
var arg0 = process.argv[2] || 'examples/testgraph.json'
var arg1 = process.argv[3] || 'src/style.css'

/* read home folder */
var path = require('path')
var graphifyPath = path.normalize(path.join(__dirname, '../'))

/* read input graph */
var inputPath = path.join(graphifyPath, arg0)
var input = fs.readFileSync(inputPath, 'utf8')

/* read style sheet */
var cssPath = path.join(graphifyPath, arg1)
var css = fs.readFileSync(cssPath, 'utf8')

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

  console.log(result)

  yield nightmare.end()

})(function (err, result)
{
  if (err) return console.log(err);
});
