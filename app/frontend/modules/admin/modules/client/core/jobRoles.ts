import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'
import { JobGroupTR } from './jobGroups'

export const JobRoleTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    code: t.string,
    description: t.string,
    jobGroupId: t.number,
    project: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.type({
        id: t.string,
      }),
      t.undefined,
    ]),
    jobGroup: JobGroupTR,
  }),
])

export type JobRole = t.TypeOf<typeof JobRoleTR>


export const Schema = {
  type: 'job_roles',
  relationships: {
    project: {
      type: 'projects',
    },
  },
}
