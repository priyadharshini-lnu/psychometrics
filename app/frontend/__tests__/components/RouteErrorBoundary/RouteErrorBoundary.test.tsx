import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'

const { I18n } = window

const Boom = ({ explode }: { explode: boolean }) => {
  if (explode) throw new Error('kaboom')
  return <div>child content</div>
}

const renderBoundary = (resetKey: string, explode: boolean) => render(
  <MemoryRouter>
    <RouteErrorBoundary resetKey={resetKey}>
      <Boom explode={explode} />
    </RouteErrorBoundary>
  </MemoryRouter>,
)

// React rethrows a caught render error on window in development; the boundary has already handled it.
const swallow = (event: ErrorEvent) => event.preventDefault()

describe('RouteErrorBoundary', () => {
  beforeEach(() => {
    window.addEventListener('error', swallow)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    window.removeEventListener('error', swallow)
    vi.restoreAllMocks()
  })

  it('renders its children while nothing throws', () => {
    const { container } = renderBoundary('a', false)

    expect(container.textContent).toContain('child content')
  })

  it('shows the error card once a child throws, without the raw error text', () => {
    const { container } = renderBoundary('a', true)

    expect(container.textContent).toContain(I18n.t('errors.error_msg'))
    expect(container.textContent).not.toContain('kaboom')
  })

  it('clears the error and renders children again when resetKey changes', () => {
    const { container, rerender } = renderBoundary('a', true)

    expect(container.textContent).toContain(I18n.t('errors.error_msg'))

    rerender(
      <MemoryRouter>
        <RouteErrorBoundary resetKey="b">
          <Boom explode={false} />
        </RouteErrorBoundary>
      </MemoryRouter>,
    )

    expect(container.textContent).toContain('child content')
    expect(container.textContent).not.toContain(I18n.t('errors.error_msg'))
  })

  it('keeps the error card while resetKey is unchanged', () => {
    const { container, rerender } = renderBoundary('a', true)

    rerender(
      <MemoryRouter>
        <RouteErrorBoundary resetKey="a">
          <Boom explode={false} />
        </RouteErrorBoundary>
      </MemoryRouter>,
    )

    expect(container.textContent).toContain(I18n.t('errors.error_msg'))
    expect(container.textContent).not.toContain('child content')
  })
})
