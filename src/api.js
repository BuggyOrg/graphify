import Nightmare from 'nightmare'
import path from 'path'
import fs from 'fs'

const graphifyPath = path.normalize(path.join(__dirname, '../'))

export function graphToWebsite (input) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(graphifyPath, 'app', 'index.html'), 'utf8', (err, graphifyPage) => {
      if (err) {
        reject(err)
      } else {
        graphifyPage = graphifyPage
          .replace(/(src|href)="(.+?)"/g, (match, attr, src) => {
            if (/https?:\/\//.test(src)) {
              return match
            } else {
              return `${attr}="file://${path.join(graphifyPath, 'app')}/${src}"`
            }
          })
          .replace('<textarea id="txtInput"></textarea>', '<textarea id="txtInput">' + JSON.stringify(input, null, 2) + '</textarea>')
        resolve(graphifyPage)
      }
    })
  })
}

export default function graphToSvg (input) {
  /* Nightmare Options */
  var nightmare = Nightmare({
    plugins: true,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true
  })
  /* Open page in nightmare and read svg result */

  return Promise.resolve(nightmare
    .goto(path.join('file://', graphifyPath, 'app', 'index.html'))
    .type('#txtInput', typeof input === 'string' ? input : JSON.stringify(input))
    .click('#btnInput')
    .wait('#svgOutput')
    .evaluate(function () {
      var svg = document.getElementById('svgOutput')
      svg.removeAttribute('baseprofile')
      svg.removeAttribute('id')
      Array.prototype.forEach.call(svg.querySelectorAll('*'), (e) => {
        e.removeAttribute('data-meta')
        e.removeAttribute('data-id')
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

export function graphToLayout (input) {
  /* Nightmare Options */
  var nightmare = Nightmare({
    plugins: true,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true
  })
  /* Open page in nightmare and read svg result */

  return Promise.resolve(nightmare
    .goto(path.join('file://', graphifyPath, 'app', 'index.html'))
    .type('#txtInput', typeof input === 'string' ? input : JSON.stringify(input))
    .click('#btnInput')
    .wait('#svgOutput')
    .evaluate(function () {
      return window.displayedGraph
    })
    .end())
}
