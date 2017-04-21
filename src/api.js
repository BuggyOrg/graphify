import path from 'path'
import fs from 'fs'
import { Graph, layout } from '@buggyorg/graphify-react'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import opentype from 'opentype.js'

const graphifyPath = path.normalize(path.join(__dirname, '../'))
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

function createTextMeasurer () {
  const font = new Promise((resolve, reject) => {
    opentype.load(require.resolve('open-sans-fontface/fonts/Regular/OpenSans-Regular.ttf'), (err, font) => {
      if (err) {
        reject(err)
      } else {
        resolve(font)
      }
    })
  })
  return (text, options) => {
    if (text == null) return 0
    return font
    .then((font) => font.getPath(text, 0, 0, options.fontSize || 16).getBoundingBox())
    .then((boundingBox) => ({
      width: boundingBox.x2 - boundingBox.x1,
      height: boundingBox.y2 - boundingBox.y1
    }))
  }
}

export function graphToSvg (input, calculateSize = createTextMeasurer()) {
  if (typeof input === 'string') input = JSON.parse(input)
  return layout(input, calculateSize)
  .then((graph) => renderToStaticMarkup(React.createElement(Graph, { graph })))
    .then((svg) => {
      var result =
        '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
        svg
      return result
    })
}

export function graphToLayout (input, calculateSize = createTextMeasurer()) {
  if (typeof input === 'string') input = JSON.parse(input)
  return layout(input, calculateSize)
}

/**
 * @deprecated use graphToLayout instead
 */
export function graphifyLayout (input, calculateSize) {
  return graphToLayout(input, calculateSize)
}
