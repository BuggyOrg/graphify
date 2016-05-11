#!/usr/bin/env node

import program from 'commander'
import Nightmare from 'nightmare'
import fs from 'fs'
import vo from 'vo'
import getStdin from 'get-stdin'
import path from 'path'

program
  .version(JSON.parse(fs.readFileSync(path.join(__dirname, '/../package.json')))['version'])
  .option('-f, --graphfile <graph file>', 'Set graph file to convert. If none is given, stdin is read.')
  .option('-o, --out <svg output file>', 'Set a custom output path. If none is given, stdout is used.')
  .option('--style <css file>', 'Use a custom stylesheet.')
  .parse(process.argv)

// read home folder
const graphifyPath = path.normalize(path.join(__dirname, '../'))

/* read input graph */
let inputPromise
if (program.graphfile) {
  inputPromise = Promise.resolve(fs.readFileSync(program.graphfile, 'utf8'))
} else {
  inputPromise = getStdin()
}

inputPromise.then((input) => {
  /* read style sheet */
  var cssPath = program.style || path.join(graphifyPath, 'src/style.css')
  var css = fs.readFileSync(cssPath, 'utf8')

  vo(function * () {
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
      .evaluate(function (css) {
        var svg = document.getElementById('svgOutput')
        svg.removeAttribute('baseprofile')
        svg.removeAttribute('id')
        Array.prototype.forEach.call(svg.querySelectorAll('*'), (e) => {
          e.removeAttribute('data-meta')
          e.removeAttribute('class')
        })
        return svg.outerHTML
      }, css)

    result = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
             '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
             result

    if (program.out) {
      fs.writeFileSync(program.out, result, 'utf8')
    } else {
      process.stdout.write(result)
    }

    yield nightmare.end()
  })(function (err, result) {
    if (err) {
      console.error(err)
    }
  })
})
