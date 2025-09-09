import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'
import { SkillGroupTR } from './skillGroups'


export const SkillTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined, t.null]),
    skillType: t.union([t.string, t.undefined]),
    project: t.union([
      t.type({
        id: t.union([t.string, t.undefined]),
        name: t.union([t.string, t.undefined]),
        clientId: t.union([t.string, t.undefined]),
      }),
      t.type({
        id: t.union([t.string, t.undefined]),
      }),
      t.undefined]),
    tagList: t.union([t.array(t.string), t.undefined]),
    skillGroup: t.union([SkillGroupTR, t.undefined]),
  })])

export type Skill = t.TypeOf<typeof SkillTR>


export const Schema = {
  type: 'skills',
  relationships: {
    project: {
      type: 'projects',
    },
  },
}
