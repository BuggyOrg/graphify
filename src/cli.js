#!/usr/bin/env node

import program from 'commander'
import fs from 'fs'
import getStdin from 'get-stdin'
import path from 'path'
import * as API from './api'
import tempfile from 'tempfile'
import open from 'open'

program
  .version(JSON.parse(fs.readFileSync(path.join(__dirname, '/../package.json')))['version'])
  .option('-f, --graphfile <graph file>', 'Set graph file to convert. If none is given, stdin is read.')
  .option('-o, --out <svg output file>', 'Set a custom output path. If none is given, stdout is used.')
  .option('-p, --page', 'Create a webpage with the graph and open the page.')
  .parse(process.argv)

/* read input graph */
let inputPromise
if (program.graphfile) {
  inputPromise = Promise.resolve(fs.readFileSync(program.graphfile, 'utf8'))
} else {
  inputPromise = getStdin()
}

if (program.page) {
  inputPromise
    .then(API.graphToWebsite)
    .then((page) => {
      var file = tempfile('.html')
      fs.writeFileSync(file, page, 'utf8')
      open(file)
    })
} else {
  inputPromise
    .then(API.graphToSvg)
    .then((svg) => {
      if (program.out) {
        fs.writeFileSync(program.out, svg + '\n', 'utf8')
      } else {
        process.stdout.write(svg + '\n')
      }
    })
    .catch((err) => {
      console.error('Generating the SVG failed', err)
    })
}
