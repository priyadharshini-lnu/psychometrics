import * as t from 'io-ts'

export const SkillTR = t.type({
  id: t.string,
  name: t.string,
  description: t.string,
})

export type Skill = t.TypeOf<typeof SkillTR>
