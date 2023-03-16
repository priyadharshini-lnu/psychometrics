import * as t from 'io-ts'

export const ProjectGeneralSettingsTR = t.type({
  id: t.string,
  name: t.union([t.string, t.null]),
  subdomain: t.union([t.string, t.null]),
  number: t.union([t.string, t.null]),
  clientId: t.union([t.string, t.null]),
  privacyConsent: t.boolean,
  enableLiveChat: t.boolean,
  locales: t.array(t.string),
  text: t.union([t.string, t.null]),
  link: t.union([t.string, t.null]),
  enablePrivacyLink: t.boolean,
})

export type ProjectGeneralSettings = t.TypeOf<typeof ProjectGeneralSettingsTR>
