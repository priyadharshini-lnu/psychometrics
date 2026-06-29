import * as t from 'io-ts'

export const RequirementStatusTR = t.type({
  isValid: t.boolean,
  requirements: t.type({
    browser: t.type({
      required: t.boolean,
    }),
    network: t.type({
      required: t.boolean,
      minimumDownloadSpeed: t.number,
      minimumUploadSpeed: t.number,
      stabilityDuration: t.number,
    }),
    audio: t.type({
      required: t.boolean,
      phraseVerificationEnabled: t.boolean,
    }),
    video: t.type({
      required: t.boolean,
      faceDetectionEnabled: t.boolean,
      minimumFaceDetectionRatio: t.number,
      phraseVerificationEnabled: t.boolean,
    }),
  }),
  sessionId: t.union([t.string, t.null]),
})


export const SystemCheckRecordTR = t.type({
  id: t.number,
  userId: t.number,
  createdAt: t.string,
  finishedAt: t.union([t.string, t.null]),
  inProgress: t.boolean,
  completed: t.boolean,
})

export const SystemCheckAddedRecordTR = t.type({
  id: t.number,
  checkType: t.string,
  passed: t.boolean,
  data: t.any,
  createdAt: t.string,
  finishedAt: t.string,
  videoUrl: t.union([t.string, t.null]),
  phraseVerificationStatus: t.union([t.string, t.null, t.undefined]),
  phraseMatched: t.union([t.boolean, t.null, t.undefined]),
})

export const SystemCheckResultsTR = t.type({
  session: SystemCheckRecordTR,
  records: t.any,
})


export type RequirementStatus = t.TypeOf<typeof RequirementStatusTR>
export type SystemCheckRecord = t.TypeOf<typeof SystemCheckRecordTR>
export type SystemCheckAddedRecord = t.TypeOf<typeof SystemCheckAddedRecordTR>
export type SystemCheckResults = t.TypeOf<typeof SystemCheckResultsTR>
