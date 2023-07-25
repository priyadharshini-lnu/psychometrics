import * as t from 'io-ts'

export const WorkshopInviteTR = t.type({
  id: t.string,
  title: t.string,
  description: t.string,
  duration: t.number,
  createAt: t.string,
  allowedLanguages: t.array(t.string),
  allowLanguagePreference: t.boolean,
  allowNeurodiversityOption: t.boolean,
})


export type WorkshopInvite = t.TypeOf<typeof WorkshopInviteTR>
