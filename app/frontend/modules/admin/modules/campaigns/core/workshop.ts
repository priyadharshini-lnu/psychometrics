import * as t from 'io-ts'

export const WorkshopTR = t.type({
  id: t.string,
  startTime: t.string,
  duration: t.number,
  bookedSeats: t.number,
  totalSeats: t.number,
  remainingSeats: t.number,
  timezone: t.string,
  meetingLink: t.string,
  workshopManagers: t.array(
    t.type({
      id: t.string,
      fullName: t.string,
      photoUrl: t.union([t.string, t.null]),
    }),
  ),
  workshopAssessors: t.array(
    t.type({
      id: t.string,
      fullName: t.string,
      photoUrl: t.union([t.string, t.null]),
    }),
  ),
})

export const WorkshopCreateResponseTR = t.type({
  workshopIds: t.array(t.number),
})

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
