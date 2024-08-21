import * as t from 'io-ts'

export const ProjectPrivacySettingsTR = t.type({
  id: t.string,
  maskIdentityForPearson: t.boolean,
  maskIdentityForSaville: t.boolean,
  maskIdentityForHogan: t.boolean,
  maskIdentityForIiht: t.boolean,
  maskIdentityForExamus: t.boolean,
  maskIdentityForMettl: t.boolean,
  privacyConsent: t.union([t.boolean, t.null]),
  customPrivacyConsent: t.boolean,
  customPrivacyConsentTexts: t.array(t.type({
    locale: t.string,
    text: t.union([t.string, t.null]),
  })),
  customPrivacyPolicyVersion: t.union([t.number, t.null]),
  privacyLinkText: t.union([t.string, t.null]),
  privacyLinkUrl: t.union([t.string, t.null]),
  enablePrivacyLink: t.boolean,
} || t.undefined)

export type ProjectPrivacySettings = t.TypeOf<typeof ProjectPrivacySettingsTR>
