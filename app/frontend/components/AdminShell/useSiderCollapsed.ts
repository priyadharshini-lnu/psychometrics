import { useCallback, useState } from 'react'
import { useResources } from '~/hooks/useResources'
import { UserPreference } from './core'
import { useCurrentUserDetails } from './AdminTheme'
import { findPreference } from './currentUserDetails'

const WORKSPACE_CATEGORY = 'workspace'
const SIDER_COLLAPSED_CONFIG_KEY = 'sider_collapsed'

// Mounts behind AdminTheme's gate, so the stored choice is there for AppShell's one read of defaultCollapsed.
export const useSiderCollapsed = (fallback: boolean) => {
  const { createResource } = useResources<UserPreference>('user_preferences')
  const details = useCurrentUserDetails()
  const stored = findPreference(details?.preferences ?? [], WORKSPACE_CATEGORY, SIDER_COLLAPSED_CONFIG_KEY)

  // Frozen: AppShell owns the rail after mount, so a later preferences change must not fight it.
  const [collapsed] = useState<boolean>(
    typeof stored?.collapsed === 'boolean' ? stored.collapsed : fallback,
  )

  // Fire-and-forget: the rail already moved, a failed write must not undo it; creates upsert server-side.
  const save = useCallback((next: boolean) => {
    createResource({
      category: WORKSPACE_CATEGORY,
      config_key: SIDER_COLLAPSED_CONFIG_KEY,
      payload: { collapsed: next },
    }).catch(() => {})
  }, [createResource])

  return { collapsed, save }
}
