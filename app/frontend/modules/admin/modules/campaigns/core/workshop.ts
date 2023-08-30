import * as t from 'io-ts'

export const userDetailsTR = t.type({
  id: t.string,
  fullName: t.string,
  photoUrl: t.union([t.string, t.null]),
  email: t.string,
  userId: t.union([t.number, t.undefined]),
})

export const WorkshopTR = t.type({
  id: t.string,
  name: t.string,
  startTime: t.string,
  duration: t.number,
  bookedSeats: t.number,
  totalSeats: t.number,
  remainingSeats: t.number,
  timezone: t.string,
  meetingLink: t.union([t.string, t.null]),
  workshopManagers: t.array(userDetailsTR),
  workshopAssessors: t.array(userDetailsTR),
  meta: t.union([
    t.type({
      permissions: t.type({
        update: t.boolean,
      }),
    }), t.undefined]),
})

export const WorkshopShortTR = t.type({
  id: t.string,
  startTime: t.string,
})

export const WorkshopCreateResponseTR = t.array(t.type({
  id: t.string,
  name: t.string,
  startTime: t.string,
  duration: t.number,
  bookedSeats: t.number,
  totalSeats: t.number,
  remainingSeats: t.number,
  timezone: t.string,
  meetingLink: t.union([t.string, t.null]),
}))

export const userDetailsListTR = t.array(userDetailsTR)

export const Workshops = {
  type: 'workshops',
  relationships: {
    workshop_managers: {
      type: 'workshop_managers',
    },
    workshop_assessors: {
      type: 'workshop_assessors',
    },
  },
}

export type Workshop = t.TypeOf<typeof WorkshopTR>
export type WorkshopShort = t.TypeOf<typeof WorkshopShortTR>
export type UserDetails = t.TypeOf<typeof userDetailsTR>
