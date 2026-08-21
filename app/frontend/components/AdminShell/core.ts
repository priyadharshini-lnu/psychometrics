import * as t from 'io-ts'

export const ThemePayloadTR = t.type({
  mode: t.string,
  light: t.string,
  dark: t.string,
})

// payload is schemaless server-side — each category owns its shape, so keep it open here.
export const UserPreferenceTR = t.type({
  id: t.string,
  category: t.string,
  config_key: t.string,
  payload: t.UnknownRecord,
})

export type UserPreference = t.TypeOf<typeof UserPreferenceTR>

export const Schema = {
  type: 'user_preferences',
}
