import * as t from 'io-ts'

export const SkillAliasTR = t.type({
  id: t.string,
  name: t.string,
  skillId: t.string,
  clientId: t.string,
  client: t.type({
    id: t.string,
    type: t.string,
  }),
  skill: t.type({
    id: t.string,
    name: t.string,
    description: t.string,
  }),
})

export type SkillAlias = t.TypeOf<typeof SkillAliasTR>

export const Schema = {
  type: 'skill_aliases',
  relationships: {
    client: {
      type: 'clients',
    },
    skill: {
      type: 'skills',
    },
  },
}
