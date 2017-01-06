import Nightmare from 'nightmare'
import path from 'path'
import fs from 'fs'
import graphify from 'graphify-node'

const graphifyPath = path.normalize(path.join(__dirname, '../'))
const nightmare = () => {
  return Nightmare({
    plugins: true,
    allowDisplayingInsecureContent: true,
    allowRunningInsecureContent: true
  })
}

export function graphToWebsite (input) {
  var inputStr = (typeof (input) === 'object') ? JSON.stringify(input, null, 2) : input
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
          .replace('value: \'\',', 'value: \'' + inputStr.split('\n').join('\\n') + '\',')
        resolve(graphifyPage)
      }
    })
  })
}

export default function graphToSvg (input) {
  /* Open page in nightmare and read svg result */
  return Promise.resolve(nightmare()
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
  /* Open page in nightmare and read svg result */
  return Promise.resolve(nightmare()
    .goto(path.join('file://', graphifyPath, 'app', 'index.html'))
    .evaluate((graph) => window.layoutGraph(graph), input)
    .end())
}

const measureTextInBrowser = (text, style) => {
  // nightmare does NOT return a normal promise.. make one out of it
  return new Promise((resolve, reject) =>
    nightmare()
      .goto(path.join('file://', graphifyPath, 'app', 'measure.html'))
      .evaluate((text, style) => window.measureText(text, style), text, style)
      .end()
      .then((size) => resolve(size), (err) => reject(err)))
}

// slow variant with graphify in node... prefer graphify in browser
// to minimize nightmare instances
export function graphifyLayout (input) {
  return graphify.layout(input, measureTextInBrowser, graphify.defaults)
}
