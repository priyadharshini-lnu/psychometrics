import * as t from 'io-ts'

export const ApplicationTR = t.type({
  id: t.string,
  name: t.string,
  disabled: t.boolean,
  email: t.union([t.string, t.null]),
  createdAt: t.union([t.string, t.null]),
  updatedAt: t.union([t.string, t.null]),
  createdBy: t.union([t.string, t.null]),
  updatedBy: t.union([t.string, t.null]),
  clientName: t.union([t.string, t.null]),
  hasApiKeys: t.boolean,
  hasPublicKeys: t.boolean,
})

export type Application = t.TypeOf<typeof ApplicationTR>

export const Schema = {
  type: 'applications',
}
