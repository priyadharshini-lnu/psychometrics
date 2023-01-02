import * as t from 'io-ts'

export const OtherAssessmentTR = t.type({
  id: t.number,
  name: t.string,
  category: t.string,
  permissions: t.type({
    exportRawResults: t.boolean,
    exportScoringResults: t.boolean,
    exportNormedResults: t.boolean,
    exportRawFactorScores: t.boolean,
    exportExternalResults: t.boolean,
    importResults: t.boolean,
    rescoreResponses: t.boolean,
  }),
})

export type OtherAssessment = t.TypeOf<typeof OtherAssessmentTR>
