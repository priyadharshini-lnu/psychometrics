import * as t from 'io-ts'

export const ApplicationSettingTR = t.type({
  id: t.string,
  ipWhitelistingEnabled: t.boolean,
})

export type ApplicationSetting = t.TypeOf<typeof ApplicationSettingTR>

export const Schema = {
  type: 'application_settings',
}
