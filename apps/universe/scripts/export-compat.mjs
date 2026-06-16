import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(appRoot, '..', '..')
const distDir = path.join(appRoot, 'dist')
const publishDir = path.join(repoRoot, 'universe')

await rm(publishDir, { recursive: true, force: true })
await mkdir(publishDir, { recursive: true })
await cp(distDir, publishDir, { recursive: true })
