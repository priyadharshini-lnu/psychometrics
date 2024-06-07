import * as t from 'io-ts'

export const ExternalAssessmentTR = t.type({
  id: t.string,
  name: t.string,
})


export type ExternalAssessment = t.TypeOf<typeof ExternalAssessmentTR>

export const AsyncExternalAssessmentTR = t.type({
  status: t.string,
  response: t.type({
    asyncRequestUuid: t.string,
    processingStatus: t.string,
    responseType: t.string,
    responseData: t.union([
      t.string,
      t.null,
      t.type({}),
    ]),
  }),
})

export type AsyncExternalAssessment = t.TypeOf<typeof AsyncExternalAssessmentTR>
