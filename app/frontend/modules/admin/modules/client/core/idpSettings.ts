import * as t from 'io-ts'

export const IdpSettingsTR = t.type({
  id: t.string,
  project: t.union([
    t.type({
      id: t.string,
    }),
    t.undefined]),
})

export type IdpSettings = t.TypeOf<typeof IdpSettingsTR>

export const Schema = {
  type: 'idp_settings',
  relationships: {
    project: {
      type: 'projects',
    },
  },
}
