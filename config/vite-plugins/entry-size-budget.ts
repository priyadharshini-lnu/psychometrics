import type { Plugin } from 'vite'

type Budget = {
  entry: string,
  label: string,
  maxKb: number,
}

// Chunks every entrypoint shares; a dependency bump should not read as route growth.
const SHARED_CHUNKS = new Set(['vendors', 'videojs-bundle'])

const kb = (bytes: number): string => `${(bytes / 1024).toFixed(1)} kB`

export default function entrySizeBudget(budget: Budget): Plugin {
  return {
    name: 'entry-size-budget',
    apply: 'build',

    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).flatMap(output => (output.type === 'chunk' ? [output] : []))
      const entry = chunks.find(chunk => chunk.isEntry && chunk.facadeModuleId?.endsWith(budget.entry))

      if (!entry) return

      const byFileName = new Map(chunks.map(chunk => [chunk.fileName, chunk]))
      const eager = new Map<string, number>()

      const visit = (fileName: string): void => {
        const chunk = byFileName.get(fileName)

        if (!chunk || eager.has(fileName) || SHARED_CHUNKS.has(chunk.name)) return

        eager.set(fileName, Buffer.byteLength(chunk.code))
        chunk.imports.forEach(visit)
      }

      visit(entry.fileName)

      const total = Array.from(eager.values()).reduce((sum, bytes) => sum + bytes, 0)
      const limit = budget.maxKb * 1024

      if (total <= limit) return

      const biggest = Array.from(eager)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([fileName, bytes]) => `${fileName} (${kb(bytes)})`)
        .join(', ')

      this.error([
        `${budget.label} now loads ${kb(total)} of application code before anything appears on screen,`,
        `which is ${kb(total - limit)} over the ${budget.maxKb} kB budget.`,
        'Every user pays this on their first visit, whichever section they open.',
        'The usual cause is a page imported at the top of a route file instead of through that section\'s',
        'shared `page` loader, which folds the whole page into the first download rather than fetching it',
        'when someone navigates to it. Switch the route to `lazy: lazyRoute(page, m => m.YourPage)`.',
        `Largest chunks in the first download: ${biggest}.`,
      ].join(' '))
    },
  }
}
