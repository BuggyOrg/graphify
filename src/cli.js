#!/usr/bin/env node

import program from 'commander'
import fs from 'fs'
import getStdin from 'get-stdin'
import path from 'path'
import generateSvg from './api'

program
  .version(JSON.parse(fs.readFileSync(path.join(__dirname, '/../package.json')))['version'])
  .option('-f, --graphfile <graph file>', 'Set graph file to convert. If none is given, stdin is read.')
  .option('-o, --out <svg output file>', 'Set a custom output path. If none is given, stdout is used.')
  .parse(process.argv)

/* read input graph */
let inputPromise
if (program.graphfile) {
  inputPromise = Promise.resolve(fs.readFileSync(program.graphfile, 'utf8'))
} else {
  inputPromise = getStdin()
}

inputPromise
  .then(generateSvg)
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
