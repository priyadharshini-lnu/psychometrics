import * as t from 'io-ts'

export const UserIdpPlanTR = t.type({
  id: t.string,
  userId: t.union([t.number, t.string]),
  idpTemplateId: t.union([t.number, t.string]),
  campaignId: t.union([t.number, t.string]),
  active: t.boolean,
  creatorId: t.union([t.number, t.string]),
})


export type UserIdpPlan = t.TypeOf<typeof UserIdpPlanTR>
