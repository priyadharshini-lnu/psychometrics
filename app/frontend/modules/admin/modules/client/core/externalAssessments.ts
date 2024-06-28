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

const HoganDataTR = t.type({
  url: t.string,
  userId: t.string,
  password: t.string,
  uniqueId: t.string,
  firstName: t.string,
  lastName: t.string,
  directAssessmentId: t.string,
  displayInformedConsent: t.string,
  returnUrl: t.string,
  languageId: t.string,
})

export type HoganData = t.TypeOf<typeof HoganDataTR>

export const AsyncHoganAssessmentTR = t.type({
  status: t.string,
  response: t.type({
    asyncRequestUuid: t.string,
    processingStatus: t.string,
    responseType: t.string,
    responseData: t.union([
      HoganDataTR,
      t.null,
      t.type({}),
    ]),
  }),
})

export type AsyncHoganAssessment = t.TypeOf<typeof AsyncHoganAssessmentTR>
