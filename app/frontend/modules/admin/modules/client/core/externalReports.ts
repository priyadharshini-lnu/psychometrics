import * as t from 'io-ts'

export const ExternalReportTR = t.type({
  id: t.string,
  name: t.string,
})


export type ExternalReport = t.TypeOf<typeof ExternalReportTR>
