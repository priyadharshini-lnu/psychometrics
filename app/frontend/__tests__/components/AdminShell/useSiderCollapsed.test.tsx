import { renderHook } from '@testing-library/react'
import { useSiderCollapsed } from '~/components/AdminShell/useSiderCollapsed'
import type { PreferenceRow } from '~/components/AdminShell/currentUserDetails'

const createResource = vi.fn<[unknown], Promise<unknown>>(() => Promise.resolve({}))

let preferences: PreferenceRow[] = []

vi.mock('~/hooks/useResources', () => ({
  useResources: () => ({ createResource }),
}))

// Stands in for AdminTheme's session gate, which is what supplies the stored preference rows.
vi.mock('~/components/AdminShell/AdminTheme', () => ({
  useCurrentUserDetails: () => ({ id: '1', preferences }),
}))

const storedCollapsed = (payload: Record<string, unknown>): PreferenceRow[] => [
  { category: 'theme', config_key: 'appearance', payload: { mode: 'light' } },
  { category: 'workspace', config_key: 'sider_width', payload: { width: 300 } },
  { category: 'workspace', config_key: 'sider_collapsed', payload },
]

describe('useSiderCollapsed', () => {
  beforeEach(() => {
    preferences = []
    createResource.mockClear()
  })

  it('prefers the stored collapse over the fallback', () => {
    preferences = storedCollapsed({ collapsed: true })
    const { result } = renderHook(() => useSiderCollapsed(false))

    expect(result.current.collapsed).toBe(true)
  })

  it('honours a stored expanded rail over a collapsed fallback', () => {
    preferences = storedCollapsed({ collapsed: false })
    const { result } = renderHook(() => useSiderCollapsed(true))

    expect(result.current.collapsed).toBe(false)
  })

  it('falls back when nothing is stored', () => {
    const { result } = renderHook(() => useSiderCollapsed(true))

    expect(result.current.collapsed).toBe(true)
  })

  it('falls back when the stored payload is not a boolean', () => {
    preferences = storedCollapsed({ collapsed: 'yes' })
    const { result } = renderHook(() => useSiderCollapsed(false))

    expect(result.current.collapsed).toBe(false)
  })

  it('holds the mount value so a later render cannot fight the shell', () => {
    preferences = storedCollapsed({ collapsed: true })
    const { result, rerender } = renderHook(() => useSiderCollapsed(false))

    preferences = storedCollapsed({ collapsed: false })
    rerender()

    expect(result.current.collapsed).toBe(true)
  })

  it('persists the new state under workspace/sider_collapsed', () => {
    const { result } = renderHook(() => useSiderCollapsed(false))

    result.current.save(true)

    expect(createResource).toHaveBeenCalledWith({
      category: 'workspace',
      config_key: 'sider_collapsed',
      payload: { collapsed: true },
    })
  })

  it('swallows a failed write', async () => {
    createResource.mockRejectedValueOnce(new Error('offline'))
    const { result } = renderHook(() => useSiderCollapsed(false))

    expect(() => result.current.save(true)).not.toThrow()
    await Promise.resolve()
  })
})
