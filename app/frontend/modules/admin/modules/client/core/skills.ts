import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const SkillTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.union([t.string, t.undefined]),
    category: t.union([t.string, t.undefined]),
    project: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.type({
        id: t.string,
      }),
      t.undefined]),
    tagList: t.union([t.array(t.string), t.undefined]),
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
