import * as t from 'io-ts'

export const ApplicationIpWhitelistEntryTR = t.type({
  id: t.string,
  ipOrCidr: t.string,
  description: t.union([t.string, t.null]),
  enabled: t.boolean,
  ipWhitelistingEnabled: t.boolean,
})

export type ApplicationIpWhitelistEntry = t.TypeOf<typeof ApplicationIpWhitelistEntryTR>

export const Schema = {
  type: 'application_ip_whitelist_entries',
}
