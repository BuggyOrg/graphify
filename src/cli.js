var Nightmare = require('nightmare')
var fs = require('fs')
var vo = require('vo')

var inputPath = "examples/hierarchy.json"
var input = fs.readFileSync(inputPath, 'utf8')

var cssPath = "src/style.css"
var css = fs.readFileSync(cssPath, 'utf8')

vo(function* () {

  var nightmare = Nightmare(
  {
    plugins: true,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true
  })

  var result = yield nightmare
    //.viewport(2000, 2000)
    .goto('file:///home/gdv/vschmidt/Buggy/buggy-meta/graphify/app/index.html')
    .type('#txtInput', input)
    .click('#btnInput')
    .wait('#svgOutput')
    .screenshot('screenshot.png')
    .evaluate(function(css) {
      document.getElementById('svgOutput').innerHTML = "<style> /* <![CDATA[ */" + css + "/* ]]> */ </style>" + document.getElementById('svgOutput').innerHTML
      return document.getElementById('svgOutput').outerHTML
    }, css)
/*    .wait('#svgOutput')
    .evaluate(function(){
      var svg = document.getElementById('svgOutput')
      return svg.outerHTML
    } )
*/
    console.log(result)

  yield nightmare.end()

})(function (err, result)
{
  if (err) return console.log(err);
  //console.log(result);
});
