import * as t from 'io-ts'
import { ResourceIdentifierTR } from '~/modules/admin/core/types/resource'
import { SkillTR } from './skills'

export const ProficiencyLevelTR = t.intersection([
  ResourceIdentifierTR,
  t.type({
    proficiencyType: t.string,
    skillId: t.union([t.string, t.null]),
    skillCategory: t.union([t.string, t.null]),
    level: t.number,
    levelDefinition: t.array(
      t.type({
        level: t.number,
        name: t.string,
        description: t.string,
      }),
    ),
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
    skill: t.union([SkillTR, t.undefined]),
  }),
])

export type ProficiencyLevel = t.TypeOf<typeof ProficiencyLevelTR>


export const Schema = {
  type: 'proficiency_levels',
  relationships: {
    project: {
      type: 'clients',
    },
    skill: {
      type: 'skills',
    },
  },
}
