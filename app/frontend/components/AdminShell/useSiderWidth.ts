import { useCallback, useState } from 'react'
import { useResources } from '~/hooks/useResources'
import { UserPreference } from './core'
import { useCurrentUserDetails } from './AdminTheme'
import { findPreference } from './currentUserDetails'

const WORKSPACE_CATEGORY = 'workspace'
const SIDER_WIDTH_CONFIG_KEY = 'sider_width'

// Mounts behind AdminTheme's gate, so the stored width is available synchronously.
export const useSiderWidth = (fallback: string) => {
  const { createResource } = useResources<UserPreference>('user_preferences')
  const details = useCurrentUserDetails()
  const stored = findPreference(details?.preferences ?? [], WORKSPACE_CATEGORY, SIDER_WIDTH_CONFIG_KEY)

  const [width, setWidth] = useState<string>(
    typeof stored?.width === 'number' ? `${stored.width}px` : fallback,
  )

  // Fire-and-forget: the drag already applied, a failed write must not undo it; creates upsert server-side.
  const save = useCallback((next: number) => {
    setWidth(`${next}px`)
    createResource({ category: WORKSPACE_CATEGORY, config_key: SIDER_WIDTH_CONFIG_KEY, payload: { width: next } })
      .catch(() => {})
  }, [createResource])

  return { width, save }
}
