import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'
import { JobRoleTR } from './jobRoles'
import { SkillTR } from './skills'

export const JobRoleSkillMappingTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    jobRoleId: t.number,
    skillId: t.number,
    expectedProficiencyLevel: t.number,
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
    jobRole: JobRoleTR,
    skill: SkillTR,
  }),
])

export type JobRoleSkillMapping = t.TypeOf<typeof JobRoleSkillMappingTR>


export const Schema = {
  type: 'skills_job_roles',
  relationships: {
    project: {
      type: 'projects',
    },
    job_role: {
      type: 'job_roles',
    },
    skill: {
      type: 'skills',
    },
  },
}
