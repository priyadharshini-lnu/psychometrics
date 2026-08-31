import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { OwnedPathsProvider } from '~/components/AdminShell/ownedPaths'
import { defaultState } from '~/modules/admin/core/ui/breadcrumbs'
import Breadcrumb from '~/modules/admin/modules/campaigns/components/Breadcrumb/Breadcrumb'

const HERE = '/admin/clients'

const crumbs = [
  { link: () => '/admin', label: () => 'Dashboard' },
  { link: () => '/assessors', label: () => 'Campaigns' },
  { link: () => '/administration/communications', label: () => 'Communications' },
  { label: () => 'Current page' },
]

const Pathname = () => <span data-testid="pathname">{useLocation().pathname}</span>

const renderBreadcrumb = (prefixes?: string[]) => render(
  <MemoryRouter initialEntries={[HERE]}>
    <OwnedPathsProvider prefixes={prefixes}>
      {/* Swallows the default action so an unrouted anchor does not reach jsdom's unimplemented navigation. */}
      <div onClick={event => event.preventDefault()}>
        <Pathname />
        <Breadcrumb crumbs={crumbs} state={defaultState} fetch={() => {}} />
      </div>
    </OwnedPathsProvider>
  </MemoryRouter>,
)

const currentPathname = () => screen.getByTestId('pathname').textContent

describe('Breadcrumb', () => {
  it('routes the crumbs the mounting router owns', async () => {
    renderBreadcrumb(['/admin', '/assessors'])

    await userEvent.click(screen.getByText('Campaigns'))

    expect(currentPathname()).toEqual('/assessors')
  })

  it('keeps a full page load for a path outside the owned prefixes', async () => {
    renderBreadcrumb(['/admin', '/assessors'])

    expect(screen.getByText('Communications').closest('a')).toHaveAttribute('href', '/administration/communications')

    await userEvent.click(screen.getByText('Communications'))

    expect(currentPathname()).toEqual(HERE)
  })

  it('full-loads every crumb when the mounting router owns nothing', async () => {
    renderBreadcrumb()

    await userEvent.click(screen.getByText('Dashboard'))

    expect(currentPathname()).toEqual(HERE)
  })

  it('renders a crumb without a link as plain text', () => {
    renderBreadcrumb(['/admin'])

    expect(screen.getByText('Current page').closest('a')).toBeNull()
  })
})
