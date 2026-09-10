import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const ClientTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    type: t.string,
    year: t.number,
    country: t.string,
    subdomain: t.union([t.string, t.null]),
    url: t.union([t.string, t.null]),
    logo: t.union([t.string, t.null, t.undefined]),
    projectManager: t.union([
      t.type({
        id: t.string,
        name: t.union([t.string, t.undefined]),
        email: t.union([t.string, t.undefined]),
      }),
      t.undefined]),
    meta: t.type({
      permissions: t.type({
        viewLicenses: t.boolean,
        viewDataReports: t.boolean,
        viewAuditReports: t.boolean,
        viewCommunicationCenter: t.boolean,
        canManageProject: t.boolean,
        manageProjectAdmins: t.boolean,
        manageProjectAssessments: t.boolean,
        manageProjectGeneralSettings: t.boolean,
        manageProjectPrivacySetting: t.boolean,
        manageProjectSmtpSettings: t.boolean,
        manageProjectWebhooks: t.boolean,
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
