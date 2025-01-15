import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'

export const SkillTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    name: t.string,
    description: t.string,
    category: t.string,
    owner: t.union([
      t.type({
        id: t.string,
        name: t.string,
      }),
      t.undefined]),
    tagList: t.array(t.union([t.string, t.null])),
  })])

export type Skill = t.TypeOf<typeof SkillTR>
