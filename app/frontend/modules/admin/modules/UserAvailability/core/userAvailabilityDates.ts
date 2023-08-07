import * as t from 'io-ts'

export const UserAvailabilityDateTR = t.type({
  id: t.string,
  startDate: t.string,
  endDate: t.string,
  timezone: t.string,
  userAvailabilityDays: t.array(
    t.type({
      day: t.number,
      startTime: t.string,
      endTime: t.string,
    }),
  ),
})

export type UserAvailabilityDate = t.TypeOf<typeof UserAvailabilityDateTR>

export const Schema = {
  type: 'user_availability_dates',
  relationships: {
    userAvailabilityDays: {
      type: 'user_availability_days',
    },
  },
}
