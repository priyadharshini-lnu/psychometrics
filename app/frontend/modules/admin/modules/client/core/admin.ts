import * as t from 'io-ts'

export const AdminListingTR = t.type({
  id: t.string,
  userId: t.string,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
})

export const ProjectAdminTR = t.type({
  id: t.string,
  userId: t.string,
  clientId: t.number,
  name: t.string,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
  grantNames: t.partial({
    clients: t.array(t.string),
    projects: t.array(t.string),
    project_settings: t.array(t.string),
    campaigns: t.array(t.string),
    dashboards: t.array(t.string),
    messages: t.array(t.string),
    sms_invites: t.array(t.string),
    results: t.array(t.string),
    registration_codes: t.array(t.string),
    communications: t.array(t.string),
    assessors: t.array(t.string),
    reports: t.array(t.string),
    datashteets: t.array(t.string),
  }),
  user: t.union([
    t.type({
      id: t.string,
      name: t.string,
      email: t.string,
    }),
    t.undefined]),
  adminRoles: t.array(t.type({
    id: t.string,
    name: t.string,
    type: t.string,
  })),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminPermissionsTR = t.type({
  loginAs: t.boolean,
  edit: t.boolean,
  remove: t.boolean,
  resetPassword: t.boolean,
  sendMail: t.boolean,
  apiKeys: t.boolean,
  export: t.boolean,
})

const CampaignAdminTR = t.type({
  id: t.string,
  userId: t.string,
  clientId: t.number,
  name: t.string,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
  grantNames: t.partial({
    campaigns: t.array(t.string),
    sms_invites: t.array(t.string),
    results: t.array(t.string),
    registration_codes: t.array(t.string),
    communications: t.array(t.string),
    assessors: t.array(t.string),
    datashteets: t.array(t.string),
  }),
  adminRoles: t.array(t.type({
    id: t.string,
    name: t.string,
    type: t.string,
  })),
})

export const CurrentUserPermissionsTR = t.type({
  clients: t.array(t.string),
  projects: t.array(t.string),
  viewProjectLicenses: t.boolean,
  manageProjectLicenses: t.boolean,
  project_settings: t.array(t.string),
  campaigns: t.array(t.string),
  dashboards: t.array(t.string),
  messages: t.array(t.string),
  sms_invites: t.array(t.string),
  results: t.array(t.string),
  registration_codes: t.array(t.string),
  communications: t.array(t.string),
  assessors: t.array(t.string),
  reports: t.array(t.string),
  datashteets: t.array(t.string),
  norms: t.array(t.string),
  dimensions: t.array(t.string),
  assessments: t.array(t.string),
  questions: t.array(t.string),
  libraries: t.array(t.string),
})

export const AdminTR = t.union(
  [ProjectAdminTR, CampaignAdminTR],
)

export const ProjectAdminViewTR = t.type({
  id: t.string,
  firstName: t.string,
  lastName: t.string,
  email: t.string,
  userId: t.string,
})

export type ProjectAdmin = t.TypeOf<typeof ProjectAdminTR>
export type CampaignAdmin = t.TypeOf<typeof CampaignAdminTR>
export type Admin = t.TypeOf<typeof AdminTR>
export type ProjectAdminViewDetails = t.TypeOf<typeof ProjectAdminViewTR>
export type AdminPermissions = t.TypeOf<typeof AdminPermissionsTR>
export type CurrentUserPermissions = t.TypeOf<typeof CurrentUserPermissionsTR>

export const Schema = {
  type: 'memberships',
  relationships: {
    admin_roles: {
      type: 'admin_roles',
    },
  },
}
