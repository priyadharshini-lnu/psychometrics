import * as t from 'io-ts'

export const WorkshopInvitedSubjectTR = t.type({
  id: t.string,
  status: t.string,
  user: t.type({
    id: t.string,
    email: t.string,
    fullName: t.string,
    photoUrl: t.union([t.string, t.null]),
  }),
  bookedWorkshopDateTime: t.union([t.string, t.null]),
  subjectWorkshopDateTime: t.union([t.string, t.null]),
})

export type WorkshopInvitedSubject = t.TypeOf<typeof WorkshopInvitedSubjectTR>

export const Schema = {
  type: 'workshop_invited_subjects',
  relationships: {
    workshops: {
      type: 'workshops',
    },
    user: {
      type: 'users',
    },
    workshop_invite: {
      type: 'workshop_invites',
    },
  },
}
