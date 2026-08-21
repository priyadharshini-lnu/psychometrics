import { render, screen } from '@testing-library/react'
import { ConfigProvider, theme } from 'antd'
import { MARSH_DARK } from '@thetalententerprise/glint'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'
import {
  GlintAdminTheme, applyStaticTheme, restoreStaticTheme,
} from '~/components/AdminShell/GlintAdminTheme'

const MARSH_PRIMARY = '#061047'

const TokenProbe = () => {
  const { token } = theme.useToken()
  return <span data-testid="primary">{token.colorPrimary}</span>
}

describe('GlintAdminTheme', () => {
  it('renders children with no redux, router or api provider around it', () => {
    render(
      <GlintAdminTheme>
        <p>standalone page</p>
      </GlintAdminTheme>,
    )

    expect(screen.getByText('standalone page')).toBeInTheDocument()
  })

  it('applies the marsh light theme by default', () => {
    render(
      <GlintAdminTheme>
        <TokenProbe />
      </GlintAdminTheme>,
    )

    expect(screen.getByTestId('primary')).toHaveTextContent(MARSH_PRIMARY)
  })

  it('honours an explicit choice', () => {
    render(
      <GlintAdminTheme choice={{ mode: 'dark', light: 'marsh-light', dark: 'marsh-dark' }}>
        <TokenProbe />
      </GlintAdminTheme>,
    )

    expect(screen.getByTestId('primary')).not.toHaveTextContent(MARSH_PRIMARY)
  })
})

describe('the static theme config', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carries the theme\'s tokens and algorithm to antd\'s global config', () => {
    const config = vi.spyOn(ConfigProvider, 'config')

    applyStaticTheme(MARSH_DARK)

    expect(config.mock.lastCall?.[0].theme?.token?.colorPrimary).toBe(MARSH_DARK.token.colorPrimary)
    expect(config.mock.lastCall?.[0].theme?.algorithm).toBe(theme.darkAlgorithm)
  })

  // DesignSettingsForm resets the global config on unmount; restoring must not leave the statics unthemed.
  it('is re-applied by restoreStaticTheme', () => {
    applyStaticTheme(MARSH_DARK)
    ConfigProvider.config({ theme: {} })

    const config = vi.spyOn(ConfigProvider, 'config')
    restoreStaticTheme()

    expect(config.mock.lastCall?.[0].theme?.token?.colorPrimary).toBe(MARSH_DARK.token.colorPrimary)
  })
})
