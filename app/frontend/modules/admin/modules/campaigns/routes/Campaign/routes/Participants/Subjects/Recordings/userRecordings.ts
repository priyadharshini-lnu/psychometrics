import * as t from 'io-ts'

export const UserRecordingTR = t.type({
  id: t.string,
  externalId: t.string,
  recordingDate: t.string,
  recordingUrl: t.string,
  assessmentCenterDateAndTime: t.union([t.string, t.null]),
  assessors: t.array(
    t.type({
      id: t.union([t.string, t.number]),
      email: t.string,
    }),
  ),
  participants: t.array(
    t.type({
      id: t.union([t.string, t.number]),
      email: t.string,
    }),
  ),
})


export type UserRecording = t.TypeOf<typeof UserRecordingTR>
