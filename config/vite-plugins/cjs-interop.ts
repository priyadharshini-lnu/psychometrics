import type { Plugin } from 'vite'

/**
 * Vite 8/Rolldown double-wraps CJS modules that set __esModule via
 * webpack's UMD output. This plugin rewrites the default import for
 * affected packages so the component class is accessible directly.
 */
export default function cjsInteropPlugin(packages: string[]): Plugin {
  const packageSet = new Set(packages)

  return {
    name: 'cjs-interop',
    enforce: 'post',

    transform: {
      filter: { id: /\.[jt]sx?$/ },
      handler(code, id) {
        if (id.includes('node_modules')) return null

        let modified = false
        let result = code

        for (const pkg of packageSet) {
          const importRegex = new RegExp(
            `import\\s+(\\w+)\\s+from\\s+['"]${pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
            'g',
          )

          result = result.replace(importRegex, (match, name) => {
            modified = true
            return `import ${name}__raw from '${pkg}';\nconst ${name} = ${name}__raw.default || ${name}__raw`
          })
        }

        return modified ? result : null
      },
    },
  }
}
