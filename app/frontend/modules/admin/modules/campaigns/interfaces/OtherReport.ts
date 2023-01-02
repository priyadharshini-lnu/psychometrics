import * as t from 'io-ts'

export const OtherReportTR = t.type({
  id: t.number,
  name: t.string,
  permissions: t.type({
    export: t.boolean,
  }),
})

export type OtherReport = t.TypeOf<typeof OtherReportTR>
