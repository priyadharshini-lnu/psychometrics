import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const RegistrationSettingsTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    id: t.string,
    requireMobileNumber: t.union([t.boolean, t.undefined]),
    project: t.union([
      t.type({
        id: t.string,
      }),
      t.undefined]),
  }),
])

export type RegistrationSettings = t.TypeOf<typeof RegistrationSettingsTR>
