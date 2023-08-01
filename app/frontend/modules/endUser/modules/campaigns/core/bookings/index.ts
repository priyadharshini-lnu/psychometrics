
import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'

export const FETCH_BOOKINGS = 'bookings/FETCH'
export const FETCH_INVITES = 'invites/FETCH'

const InviteTR = t.type({
  id: t.number,
  title: t.string,
  description: t.string,
  duration: t.number,
  status: t.string,
})
const fetchInvitesResponseTR = t.type({
  list: t.array(InviteTR),
})

const BookingTR = t.type({
  id: t.number,
  title: t.string,
  description: t.string,
  duration: t.number,
  status: t.string,
  isActionByCurrentUser: t.boolean,
})

export type Invite = t.TypeOf<typeof InviteTR>

export type FetchInvitesResponse = t.TypeOf<typeof fetchInvitesResponseTR>

export const fetchInvites = ():ApiAction<FetchInvitesResponse> => ({
  type: FETCH_INVITES,
  request: {
    typedResponse: fetchInvitesResponseTR,
    url: '/workshop_invites',
    loader: true,
    body: {
      type: 'invites',
    },
  },
})

const fetchBookingsResponseTR = t.type({
  list: t.array(BookingTR),
})

export type Booking = t.TypeOf<typeof BookingTR>

export type FetchBookingsResponse = t.TypeOf<typeof fetchBookingsResponseTR>

export const fetchBookings = ():ApiAction<FetchBookingsResponse> => ({
  type: FETCH_BOOKINGS,
  request: {
    typedResponse: fetchBookingsResponseTR,
    url: '/workshop_bookings',
    loader: true,
    body: {
      type: 'bookings',
    },
  },
})
