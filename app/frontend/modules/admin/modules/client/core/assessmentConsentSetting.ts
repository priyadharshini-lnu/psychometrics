import * as t from 'io-ts'

export const AssessmentConsentSettingTR = t.type({
  id: t.string,
  assessmentId: t.string,
  dataRole: t.union([t.string, t.null]),
  customConsentTexts: t.array(t.type({
    locale: t.string,
    text: t.union([t.string, t.null]),
  })),
  customAcknowledgmentTexts: t.array(t.type({
    locale: t.string,
    text: t.union([t.string, t.null]),
  })),
  policyVersion: t.union([t.number, t.null]),
})

export type AssessmentConsentSetting = t.TypeOf<typeof AssessmentConsentSettingTR>
