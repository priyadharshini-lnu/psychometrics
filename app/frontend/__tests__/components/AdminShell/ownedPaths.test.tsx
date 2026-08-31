import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { OwnedPathsProvider, isOwnedPath, useIsOwnedPath } from '~/components/AdminShell/ownedPaths'
import { brandHomePath } from '~/components/AdminShell/AdminShell'

const Probe = ({ path }: { path?: string }) => {
  const isOwned = useIsOwnedPath()

  return <span data-testid="owned">{String(isOwned(path))}</span>
}

const renderProbe = (children: ReactNode) => {
  render(<>{children}</>)
  return screen.getByTestId('owned').textContent
}

describe('isOwnedPath', () => {
  it.each([
    ['/admin/users', ['/admin'], true],
    ['/admin', ['/admin'], true],
    ['/admin/users', ['/admin/'], true],
    ['/administration/communications', ['/admin'], false],
    ['/assessors/campaigns/1/users', ['/admin', '/assessors'], true],
    ['/assessors', ['/admin'], false],
  ])('%s under %s is %s', (path, prefixes, expected) => {
    expect(isOwnedPath(path, prefixes)).toBe(expected)
  })

  it('owns nothing when no prefixes are given', () => {
    expect(isOwnedPath('/admin/users')).toBe(false)
  })

  it('owns every path for a root prefix, since a router mounted at / owns the whole app', () => {
    expect(isOwnedPath('/anything/at/all', ['/'])).toBe(true)
  })
})

describe('useIsOwnedPath', () => {
  it('reads the prefixes the surrounding shell published', () => {
    expect(renderProbe(
      <OwnedPathsProvider prefixes={['/admin', '/assessors']}><Probe path="/assessors" /></OwnedPathsProvider>,
    )).toEqual('true')
  })

  it('owns nothing outside a provider', () => {
    expect(renderProbe(<Probe path="/admin/users" />)).toEqual('false')
  })

  it('owns nothing when the shell declared no prefixes', () => {
    expect(renderProbe(<OwnedPathsProvider><Probe path="/admin/users" /></OwnedPathsProvider>)).toEqual('false')
  })

  it('treats a missing path as unowned', () => {
    expect(renderProbe(<OwnedPathsProvider prefixes={['/admin']}><Probe /></OwnedPathsProvider>)).toEqual('false')
  })
})

describe('brandHomePath', () => {
  it('points an admin at the admin dashboard', () => {
    expect(brandHomePath({ clients: '/admin/clients', assessorDashboard: '/assessors' })).toEqual('/admin')
  })

  it('points an assessor-only user at their own dashboard', () => {
    expect(brandHomePath({ assessorDashboard: '/assessors', profile: '/admin/profile' })).toEqual('/assessors')
  })

  it('falls back to the admin shell when no dashboard link was served at all', () => {
    expect(brandHomePath({ profile: '/admin/profile' })).toEqual('/admin')
  })
})
