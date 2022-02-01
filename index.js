const { compileFromFile } = require('json-schema-to-typescript')
const { promisfy } = require('promisfy')
const glob = require('glob')
const path = require('path')
const fs = require('fs')

const outDir = path.join(__dirname, 'out')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir)
}
const globPromise = promisfy(glob)
const writeFilePromise = promisfy(fs.writeFile)

globPromise('./schema/*.schema.json')
  .then((matches) => {
    return Promise.all(matches.map((match) => 
      compileFromFile(match, {
        cwd: './schema',
      })
        .then(ts => [path.basename(match).split('.')[0], ts])
    ))
  })
  .then((compiled) => {
    return Promise.all(compiled.map(([entityName, ts]) => {
      return writeFilePromise(path.join(outDir, `${entityName}.d.ts`), ts)
    }))
  })
