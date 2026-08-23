import * as t from 'io-ts'

export const ThemePayloadTR = t.type({
  mode: t.string,
  light: t.string,
  dark: t.string,
})

export const UserPreferenceTR = t.intersection([
  t.type({
    id: t.string,
    category: t.string,
    config_key: t.string,
    payload: t.UnknownRecord,
  }),
  t.partial({
    resource_type: t.union([t.string, t.null]),
    resource_id: t.union([t.string, t.number, t.null]),
  }),
])

export type UserPreference = t.TypeOf<typeof UserPreferenceTR>

export const TableFiltersTR = t.record(t.string, t.union([t.string, t.array(t.string)]))

export type TableFilters = t.TypeOf<typeof TableFiltersTR>

export const TableSettingsPayloadTR = t.partial({
  hidden_columns: t.array(t.string),
  filters: TableFiltersTR,
  display_panel_open: t.boolean,
})

export const Schema = {
  type: 'user_preferences',
}
