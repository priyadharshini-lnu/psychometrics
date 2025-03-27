import * as t from 'io-ts'

export const ProjectAssessmentTR = t.type({
  id: t.string,
  projectId: t.string,
  assessmentId: t.number,
  normalizeFactorScores: t.boolean,
  userResultValidityInDays: t.union([t.number, t.null]),
  createdAt: t.string,
  updatedAt: t.string,
  type: t.string,
  assessment: t.type({
    id: t.string,
    name: t.string,
  }),
})

export type ProjectAssessment = t.TypeOf<typeof ProjectAssessmentTR>
