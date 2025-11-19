import * as t from 'io-ts'

export const WorkshopRecordingTR = t.type({
  id: t.string,
  externalId: t.string,
  recordingDate: t.string,
  recordingUrl: t.string,
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
  transcriptionUrl: t.union([t.string, t.null]),
})

export type WorkshopRecording = t.TypeOf<typeof WorkshopRecordingTR>
