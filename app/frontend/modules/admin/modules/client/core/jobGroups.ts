import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const JobGroupTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
  }),
])

export type JobGroup = t.TypeOf<typeof JobGroupTR>


export const Schema = {
  type: 'job_groups',
  relationships: {
    project: {
      type: 'projects',
    },
  },
}
