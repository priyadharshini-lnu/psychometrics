import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const SkillGroupTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
  }),
])

export type SkillGroup = t.TypeOf<typeof SkillGroupTR>


export const Schema = {
  type: 'skill_groups',
  relationships: {
    project: {
      type: 'projects',
    },
  },
}
