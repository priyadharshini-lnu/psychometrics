import { readFileSync, readdirSync } from 'fs'
import { dirname, resolve } from 'path'
import adminRoutes from '~/modules/admin/routes'
import { pageChunk } from '~/utils/usePageChunk'

const frontendDir = resolve(process.cwd(), 'app/frontend')
const modulesDir = resolve(frontendDir, 'modules')

const CALL = /lazyPages\(\s*'([^']+)',\s*\(\) => import\('([^']+)'\)/g

const sourceFiles = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const path = resolve(dir, entry.name)

  if (entry.isDirectory()) return sourceFiles(path)

  return /\.tsx?$/.test(entry.name) ? [path] : []
})

const chunkNames = () => {
  const names = new Map<string, Set<string>>()

  sourceFiles(modulesDir).forEach((file) => {
    const source = readFileSync(file, 'utf8')

    Array.from(source.matchAll(CALL)).forEach(([, name, specifier]) => {
      const target = specifier.startsWith('~/')
        ? resolve(frontendDir, specifier.slice(2))
        : resolve(dirname(file), specifier)

      names.set(name, (names.get(name) || new Set()).add(target))
    })
  })

  return names
}

// The chunk name is what a shell keys its suspense boundary on, so it has to name exactly one dynamic import.
describe('page chunk names', () => {
  it('names one dynamic import each', () => {
    const perName = Array.from(chunkNames()).map(([name, targets]) => [name, targets.size])

    expect(perName).not.toHaveLength(0)
    expect(perName.filter(([, size]) => size !== 1)).toEqual([])
  })

  it('gives every dynamic import a single name', () => {
    const perTarget = new Map<string, string[]>()

    chunkNames().forEach((targets, name) => targets.forEach((target) => {
      perTarget.set(target, (perTarget.get(target) || []).concat(name))
    }))

    expect(Array.from(perTarget).filter(([, names]) => names.length !== 1)).toEqual([])
  })
})

describe('the chunk an admin url waits on', () => {
  const tree = [{ path: '/admin/*', children: adminRoutes }]
  const chunkOf = (pathname: string) => pageChunk(tree, pathname)

  it('is the module the matched page was split into', () => {
    expect(chunkOf('/admin/users/users')).toEqual('users')
    expect(chunkOf('/admin/users/admins')).toEqual('users')
    expect(chunkOf('/admin/clients')).toEqual('client')
    expect(chunkOf('/admin/clients/1')).toEqual('client')
    expect(chunkOf('/admin/clients/1/projects')).toEqual('client')
    expect(chunkOf('/admin/clients/1/data_reports')).toEqual('client')
    expect(chunkOf('/admin/clients/1/data_reports/2')).toEqual('dataReports')
    expect(chunkOf('/admin/projects/1/taxonomy/skills')).toEqual('skillsTaxonomy')
    expect(chunkOf('/admin/projects/1/idp/development_actions')).toEqual('developmentActions')
    expect(chunkOf('/admin/projects/1/new_campaigns/2/participants')).toEqual('campaigns')
    expect(chunkOf('/admin/projects/1/new_campaigns/2/scoring')).toEqual('campaigns')
    expect(chunkOf('/admin/settings/maintenance')).toEqual('settings')
  })
})
