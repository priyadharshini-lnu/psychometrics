import { render, screen } from '@testing-library/react'
import { theme } from 'antd'
import { describe, expect, it } from 'vitest'
import { GlintAdminTheme } from '~/components/AdminShell/GlintAdminTheme'

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
