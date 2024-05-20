import * as t from 'io-ts'

export const SmsHistoryTR = t.type({
  id: t.string,
  firstName: t.string,
  lastName: t.string,
  mobileNo: t.string,
  status: t.string,
  segmentLength: t.number,
  createdAt: t.string,
  smsRecord: t.type({
    id: t.string,
    message: t.string,
  }),
})

export type SmsHistory = t.TypeOf<typeof SmsHistoryTR>
