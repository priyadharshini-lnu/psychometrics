import * as t from 'io-ts'

export const OtherReportTR = t.type({
  id: t.number,
  name: t.string,
  permissions: t.type({
    export: t.boolean,
  }),
  assessmentIds: t.array(t.number),
  reportProvider: t.union([t.string, t.null]),
  effectiveDefaultLanguage: t.union([t.string, t.null]),
  availableLanguages: t.union([t.array(t.string), t.null]),
  tenantId: t.union([t.number, t.null]),
})

export type OtherReport = t.TypeOf<typeof OtherReportTR>
