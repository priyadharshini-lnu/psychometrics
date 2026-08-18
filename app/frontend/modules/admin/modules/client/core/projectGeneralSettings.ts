import * as t from 'io-ts'

export const ProjectGeneralSettingsTR = t.type({
  id: t.string,
  name: t.union([t.string, t.null]),
  subdomain: t.union([t.string, t.null]),
  number: t.union([t.string, t.null]),
  clientId: t.union([t.string, t.null]),
  enableLiveChat: t.boolean,
  locales: t.array(t.string),
  showBookings: t.boolean,
  campaignDashboardInstructions: t.union([t.string, t.null]),
})

export type ProjectGeneralSettings = t.TypeOf<typeof ProjectGeneralSettingsTR>
