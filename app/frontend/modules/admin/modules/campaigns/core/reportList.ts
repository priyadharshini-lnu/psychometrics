import * as t from 'io-ts'
import { ResourceIdentifierTR } from './resource'

export const ReportTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
  }),
])

export type Report = t.TypeOf<typeof ReportTR>
