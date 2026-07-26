import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = ['dist/react/index.js', 'dist/react/index.cjs']

for (const file of files) {
  const path = resolve(process.cwd(), file)
  let source = readFileSync(path, 'utf8')
  source = source.replace(/^["']use client["'];?\s*/gm, '')
  writeFileSync(path, `"use client";\n${source}`)
  console.log(`prefixed "use client" → ${file}`)
}
