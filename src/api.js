import Nightmare from 'nightmare'
import path from 'path'
import fs from 'fs'
import graphify from 'graphify'

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
    typeInterval: 0.00000001,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true
  })
  /* Open page in nightmare and read svg result */

  return Promise.resolve(nightmare
    .goto(path.join('file://', graphifyPath, 'app', 'index.html'))
    .evaluate((graph) => window.renderGraph(graph), input)
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
    typeInterval: 0,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true
  })
  /* Open page in nightmare and read svg result */

  return Promise.resolve(nightmare
    .goto(path.join('file://', graphifyPath, 'app', 'index.html'))
    .evaluate((graph) => window.layoutGraph(graph), input)
    .end())
}

const measureTextInBrowser = (text, style) => {
  var nightmareMeasureInstance = null
  if (!nightmareMeasureInstance) {
    var nightmare = Nightmare({
      plugins: true,
      allowDisplayingInsecureContent: true,
      allowRunningInsecureContent: true
    })
    nightmareMeasureInstance = nightmare
      .goto(path.join('file://', graphifyPath, 'app', 'measure.html'))
  }
  // nightmare does NOT return a normal promise.. make one out of it
  return new Promise((resolve) =>
    nightmareMeasureInstance
      // .evaluate((text, style) => window.measureText(text, style), text, style)
      .evaluate((text, style) => window.measureText(text, style), text, style)
      .end()
      .then((size) => resolve(size), (err) => console.error(err)))
}


export function graphifyLayout (input) {
  return graphify.layout(input, graphify.defaults, measureTextInBrowser)
  // .then((kgraph) => graphToSvg(kgraph))
  .then((res) => console.log(res))
}
