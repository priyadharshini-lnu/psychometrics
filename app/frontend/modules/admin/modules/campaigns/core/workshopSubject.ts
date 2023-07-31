import * as t from 'io-ts'

export const WorkshopSubjectTR = t.type({
  id: t.string,
  status: t.string,
  attended: t.boolean,
  preworks: t.string,
  workshopActivities: t.string,
  user: t.union([
    t.type({
      fullName: t.union([t.string, t.null]),
      email: t.union([t.string, t.null]),
    }),
    t.undefined]),
})

export const Schema = {
  type: 'workshop_subjects',
  relationships: {
    user: {
      type: 'users',
    },
  },
}

export type WorkshopSubject = t.TypeOf<typeof WorkshopSubjectTR>
