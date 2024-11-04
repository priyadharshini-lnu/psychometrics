import * as t from 'io-ts'

export const ClientPrivacySettingsTR = t.type({
  id: t.string,
  disableDataProcessing: t.boolean,
})

export type ClientPrivacySettings = t.TypeOf<typeof ClientPrivacySettingsTR>
