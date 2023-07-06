
import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'

export const FETCH_BOOKINGS = 'bookings/FETCH'
export const FETCH_INVITES = 'invites/FETCH'

const InviteTR = t.type({
  id: t.number,
  title: t.string,
  description: t.string,
  duration: t.number,
})
const fetchInvitesResponseTR = t.type({
  list: t.array(InviteTR),
})

export type Invite = t.TypeOf<typeof InviteTR>

export type FetchInvitesResponse = t.TypeOf<typeof fetchInvitesResponseTR>

export const fetchInvites = ():ApiAction<FetchInvitesResponse> => ({
  type: FETCH_INVITES,
  request: {
    typedResponse: fetchInvitesResponseTR,
    url: '/invites',
    loader: true,
    mocked: true,
  },
})

const BookingTR = t.intersection([InviteTR, t.type({ dateTime: t.string })])
const fetchBookingsResponseTR = t.type({
  list: t.array(BookingTR),
})

export type Booking = t.TypeOf<typeof BookingTR>

export type FetchBookingsResponse = t.TypeOf<typeof fetchBookingsResponseTR>

export const fetchBookings = ():ApiAction<FetchBookingsResponse> => ({
  type: FETCH_BOOKINGS,
  request: {
    typedResponse: fetchBookingsResponseTR,
    url: '/bookings',
    loader: true,
    mocked: true,
  },
})
