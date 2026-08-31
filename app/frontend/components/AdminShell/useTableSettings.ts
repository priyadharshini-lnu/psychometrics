import { useCallback, useRef, useState } from 'react'
import { isRight } from 'fp-ts/Either'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import { useResources } from '~/hooks/useResources'
import { TableSettingsPayloadTR } from './core'
import type { TableFilters, UserPreference } from './core'
import { useCurrentUserDetails } from './AdminTheme'
import { findPreference } from './currentUserDetails'
import type { PreferenceRow, PreferenceScope } from './currentUserDetails'

const TABLE_SETTINGS_CATEGORY = 'table_settings'
const WRITE_DELAY = 500

export type TableSettings = {
  hiddenColumns: string[]
  filters: TableFilters
  panelOpen?: boolean
}

const storedSettings = (rows: PreferenceRow[], configKey: string, scope?: PreferenceScope): TableSettings => {
  const decoded = TableSettingsPayloadTR.decode(findPreference(rows, TABLE_SETTINGS_CATEGORY, configKey, scope) ?? {})
  const payload = isRight(decoded) ? decoded.right : {}

  return {
    hiddenColumns: payload.hidden_columns ?? [],
    filters: payload.filters ?? {},
    panelOpen: payload.display_panel_open,
  }
}

export const useTableSettings = (configKey: string, scope?: PreferenceScope) => {
  const { createResource } = useResources<UserPreference>('user_preferences')
  const details = useCurrentUserDetails()
  const [initial] = useState(() => storedSettings(details?.preferences ?? [], configKey, scope))
  const [settings, setSettings] = useState<TableSettings>(initial)

  // The row is written whole, so a patch merges onto the last one rather than dropping the keys it says nothing about.
  const latestSettings = useRef(initial)
  // Held across renders so a run of keystrokes settles into one write; the request is passed in, not captured.
  const send = useRef(debounce((write: () => void) => write(), WRITE_DELAY)).current

  // Fire-and-forget: the table already moved, a failed write must not undo it; creates upsert server-side.
  const save = useCallback((patch: Partial<TableSettings>) => {
    const next = { ...latestSettings.current, ...patch }
    if (isEqual(next, latestSettings.current)) return

    latestSettings.current = next
    setSettings(next)
    send(() => {
      createResource({
        category: TABLE_SETTINGS_CATEGORY,
        config_key: configKey,
        resource_type: scope?.resourceType,
        resource_id: scope?.resourceId,
        payload: {
          hidden_columns: next.hiddenColumns,
          filters: next.filters,
          display_panel_open: next.panelOpen,
        },
      }).catch(() => {})
    })
  }, [createResource, configKey, scope?.resourceType, scope?.resourceId, send])

  return { initial, settings, save }
}
