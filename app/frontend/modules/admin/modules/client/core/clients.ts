import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    year: t.number,
    country: t.string,
    projectManager: t.union([
      t.type({
        id: t.string,
        name: t.string,
        email: t.string,
      }),
      t.undefined]),
    meta: t.type({
      permissions: t.type({
        viewLicenses: t.boolean,
        viewDataReports: t.boolean,
        viewAuditReports: t.boolean,
      }),
    }),
  }),
])

export type Client = t.TypeOf<typeof ClientTR>

export const Schema = {
  type: 'clients',
  fields: {
    year: { type: 'number' },
  },
  relationships: {
    projectManager: {
      type: 'users',
    },
  },
}
