import * as t from 'io-ts'

export const WorkshopInviteTR = t.type({
  id: t.string,
  title: t.string,
  description: t.string,
  duration: t.number,
  createdAt: t.string,
  allowedLanguages: t.array(t.string),
  allowLanguagePreference: t.boolean,
  allowNeurodiversityOption: t.boolean,
  subjects: t.array(t.type({ subjectId: t.string })),
  workshopIds: t.array(t.string),
  campaignId: t.string,
  translations: t.array(t.type({
    locale: t.string,
    title: t.string,
    description: t.string,
  })),
  workshops: t.array(t.type({
    id: t.string,
    startTime: t.string,
  })),
})

export const Schema = {
  type: 'workshop_invites',
  relationships: {
    workshops: {
      type: 'workshops',
    },
  },
}

export type WorkshopInvite = t.TypeOf<typeof WorkshopInviteTR>
