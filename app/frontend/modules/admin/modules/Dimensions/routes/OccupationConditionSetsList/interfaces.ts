import * as t from 'io-ts'

export const OccupationConditionSetTR = t.type({
  id: t.string,
  name: t.string,
  isDefault: t.boolean,
})

export type OccupationConditionSet = t.TypeOf<typeof OccupationConditionSetTR>
