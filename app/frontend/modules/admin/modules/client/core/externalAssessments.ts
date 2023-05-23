import * as t from 'io-ts'

export const ExternalAssessmentTR = t.type({
  id: t.string,
  name: t.string,
})


export type ExternalAssessment = t.TypeOf<typeof ExternalAssessmentTR>
