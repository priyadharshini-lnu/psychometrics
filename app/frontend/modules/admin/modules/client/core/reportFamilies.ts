import * as t from 'io-ts'

export const ReportFamilyTR = t.type({
  id: t.string,
  name: t.string,
})

export type ReportFamily = t.TypeOf<typeof ReportFamilyTR>
