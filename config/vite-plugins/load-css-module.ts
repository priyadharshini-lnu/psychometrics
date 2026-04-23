import { posix as path } from 'path'
import nativePath from 'path'
import { promises as fs } from 'fs'
import type { Plugin, ResolvedConfig } from 'vite'

const queryRE = /\?.*$/s
const hashRE = /#.*$/s
const cleanUrl = (url: string): string =>
  url.replace(hashRE, '').replace(queryRE, '')

let resolvedConfig: ResolvedConfig

type FullPath = string
const cssModuleMap = new Map<FullPath, FullPath>()
const originFileMap = new Map<FullPath, FullPath>()
const watchFiles = new Set<string>()
const resolveCache = new Map<string, string | null>()

function getFullPath(id: string): string {
  return path.join(resolvedConfig.root, id)
}

function getFilePath(id: string): string | undefined {
  const fullPath = getFullPath(id)
  if (cssModuleMap.has(id)) return cssModuleMap.get(id)
  if (id.startsWith('/') && cssModuleMap.has(fullPath))
    return cssModuleMap.get(fullPath)
}

export interface LoadCssModuleOptions {
  include: (id: string) => boolean | undefined
}

export default function loadCssModulePlugin(options: LoadCssModuleOptions): Plugin {
  const { include } = options

  return {
    name: 'load-css-module',
    enforce: 'pre',

    configResolved(config) {
      resolvedConfig = config
    },

    resolveId: {
      filter: { id: /\.less/ },
      async handler(id, importer, resolveOpts) {
        const cleanId = id.split('?')[0]
        if (!cleanId.endsWith('.less')) {
          if (id.startsWith('/') && cssModuleMap.has(getFullPath(id)))
            return getFullPath(id)
          return null
        }
        if (!include(id)) return null

        if (id.startsWith('/')) {
          const fullPath = getFullPath(id)
          if (cssModuleMap.has(fullPath)) return fullPath
        }

        const cacheKey = `${id}\0${importer || ''}`
        if (resolveCache.has(cacheKey)) {
          const cached = resolveCache.get(cacheKey)
          return cached || null
        }

        let resolvedPath: string
        if (importer && (id.startsWith('./') || id.startsWith('../'))) {
          resolvedPath = nativePath.resolve(nativePath.dirname(importer), id)
        } else if (id.startsWith('~/') || id.startsWith('@/')) {
          resolvedPath = nativePath.join(resolvedConfig.root, 'app/frontend', id.slice(2))
        } else if (nativePath.isAbsolute(id)) {
          resolvedPath = id
        } else {
          const result = await this.resolve(id, importer, {
            ...resolveOpts,
            skipSelf: true,
          })
          if (!result) {
            resolveCache.set(cacheKey, null)
            return null
          }
          resolvedPath = result.id
        }
        const p = path.parse(resolvedPath)
        const newPath = path.format({ ...p, base: `${p.name}.module${p.ext}` })

        cssModuleMap.set(newPath, resolvedPath)
        originFileMap.set(resolvedPath, newPath)
        resolveCache.set(cacheKey, newPath)
        if (!watchFiles.has(resolvedPath)) {
          watchFiles.add(resolvedPath)
          this.addWatchFile(resolvedPath)
        }
        return newPath
      },
    },

    hotUpdate({ file, server }) {
      if (!originFileMap.has(file)) return

      const { root } = server.config
      const cssModuleFile = originFileMap.get(file)!
      let matched = this.environment.moduleGraph.getModulesByFile(cssModuleFile)

      if (!matched && cssModuleFile.startsWith(root)) {
        matched = this.environment.moduleGraph.getModulesByFile(
          cssModuleFile.replace(root, ''),
        )
      }

      return [...(matched || [])]
    },

    load: {
      filter: { id: /\.module\.less/ },
      async handler(id) {
        const filePath = getFilePath(id)
        if (filePath) {
          try {
            return await fs.readFile(cleanUrl(filePath), 'utf-8')
          } catch {
            return fs.readFile(filePath, 'utf-8')
          }
        }
      },
    },
  }
}
