import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const AssessmentTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
  }),
])

export type Assessment = t.TypeOf<typeof AssessmentTR>
