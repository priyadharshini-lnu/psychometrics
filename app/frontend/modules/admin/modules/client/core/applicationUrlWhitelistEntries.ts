import * as t from 'io-ts'

export const ApplicationUrlWhitelistEntryTR = t.type({
  id: t.string,
  url: t.string,
  description: t.union([t.string, t.null]),
  enabled: t.boolean,
  urlWhitelistingEnabled: t.boolean,
})

export type ApplicationUrlWhitelistEntry = t.TypeOf<typeof ApplicationUrlWhitelistEntryTR>

export const Schema = {
  type: 'application_url_whitelist_entries',
}

export const ApplicationUrlWhitelistSettingTR = t.type({
  id: t.string,
  urlWhitelistingEnabled: t.boolean,
})

export type ApplicationUrlWhitelistSetting = t.TypeOf<typeof ApplicationUrlWhitelistSettingTR>
