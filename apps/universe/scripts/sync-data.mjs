import { mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const source = path.join(repoRoot, 'data', 'memories.json')
const targetDir = path.join(appRoot, 'public')
const target = path.join(targetDir, 'data.json')

await mkdir(targetDir, { recursive: true })
await copyFile(source, target)
