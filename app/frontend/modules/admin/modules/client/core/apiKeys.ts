import * as t from 'io-ts'

export type APIKey = t.TypeOf<typeof APIKeyTR>
export type APIKeysMeta = t.TypeOf<typeof APIKeysMetaTR>

export const APIKeysMetaTR = t.type({
  user: t.type({
    email: t.string,
  }),
})
export const APIKeyTR = t.type({
  id: t.string,
  key: t.string,
  token: t.string,
  disabled: t.boolean,
  description: t.union([t.string, t.null]),
  createdAt: t.union([t.string, t.null]),
  updatedAt: t.union([t.string, t.null]),
})
