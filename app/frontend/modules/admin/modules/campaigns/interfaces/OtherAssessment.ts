import * as t from 'io-ts'

export const OtherAssessmentTR = t.type({
  id: t.number,
  name: t.string,
  category: t.string,
  dimensionId: t.union([t.number, t.null, t.undefined]),
  owner: t.union([
    t.type({
      id: t.number,
      name: t.string,
    }),
    t.null,
    t.undefined,
  ]),
  permissions: t.partial({
    exportRawResults: t.boolean,
    exportScoringResults: t.boolean,
    exportNormedResults: t.boolean,
    exportRawFactorScores: t.boolean,
    exportExternalResults: t.boolean,
    importResults: t.boolean,
    rescoreResponses: t.boolean,
  }),
  tenantId: t.union([t.number, t.null, t.undefined]),
})

export type OtherAssessment = t.TypeOf<typeof OtherAssessmentTR>
