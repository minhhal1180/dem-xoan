import { lstat, realpath, rm } from 'node:fs/promises'
import path from 'node:path'
const root = await realpath(process.cwd())
const target = path.join(root, 'dist')
try {
  const stat = await lstat(target)
  if (stat.isSymbolicLink() || (await realpath(target)) !== target || !target.startsWith(root + path.sep)) {
    throw new Error('Refusing to clean an output path outside this checkout')
  }
  console.log(`Cleaning verified build output: ${target}`)
  await rm(target, { recursive: true, force: true })
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}
