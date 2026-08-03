import { render, screen, waitFor } from '@testing-library/react'
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest'
import { AdminTheme } from '~/components/AdminShell/AdminTheme'
import { DefaultAntThemeWrapper } from '~/glint'

vi.mock('~/components/AdminShell/useThemePreference', () => ({
  THEME_CATEGORY: 'theme',
  THEME_CONFIG_KEY: 'appearance',
  useThemePreference: () => ({ persist: vi.fn() }),
}))

const MARSH_PRIMARY = '#061047'

beforeEach(() => {
  document.documentElement.removeAttribute('style')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { id: '1', attributes: { preferences: [] } } }),
  }))
})

describe('AdminTheme inside DefaultAntThemeWrapper', () => {
  // Guards the effect ordering: the legacy wrapper writes --ant-* first, AdminTheme's bridge must overwrite it.
  it('leaves the marsh primary on the legacy --ant-* vars', async () => {
    render(
      <DefaultAntThemeWrapper>
        <AdminTheme>
          <p>page content</p>
        </AdminTheme>
      </DefaultAntThemeWrapper>,
    )

    await screen.findByText('page content')

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--ant-primary-color')).toBe(MARSH_PRIMARY)
    })
  })
})
