import { render, screen, waitFor } from '@testing-library/react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest'
import { AdminTheme } from '~/components/AdminShell/AdminTheme'

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

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AdminTheme', () => {
  // The only writer of --ant-* on admin now: nothing above it seeds them any more.
  it('leaves the marsh primary on the legacy --ant-* vars', async () => {
    render(
      <AdminTheme>
        <p>page content</p>
      </AdminTheme>,
    )

    await screen.findByText('page content')

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('--ant-primary-color')).toBe(MARSH_PRIMARY)
    })
  })

  // antd's statics render detached from the tree, so the global config is the only theming channel they have.
  it('pushes the marsh theme into antd\'s global static config', async () => {
    const config = vi.spyOn(ConfigProvider, 'config')

    render(
      <AdminTheme>
        <p>page content</p>
      </AdminTheme>,
    )

    await screen.findByText('page content')

    await waitFor(() => expect(config).toHaveBeenCalled())

    const applied = config.mock.lastCall?.[0].theme
    expect(applied?.token?.colorPrimary).toBe(MARSH_PRIMARY)
    expect(applied?.algorithm).toBe(antdTheme.defaultAlgorithm)
  })
})
