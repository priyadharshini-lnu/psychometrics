
import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'

const InviteTR = t.type({
  id: t.number,
  title: t.union([t.string, t.null]),
  description: t.union([t.string, t.null]),
  duration: t.union([t.number, t.null]),
  status: t.string,
  workshopInviteId: t.number,
})
const fetchInvitesResponseTR = t.type({
  list: t.array(InviteTR),
})
export const FETCH_INVITES = 'invites/FETCH'
export type Invite = t.TypeOf<typeof InviteTR>
export type FetchInvitesResponse = t.TypeOf<typeof fetchInvitesResponseTR>
export const fetchInvites = ():ApiAction<FetchInvitesResponse> => ({
  type: FETCH_INVITES,
  request: {
    typedResponse: fetchInvitesResponseTR,
    url: '/workshop_invites',
    loader: true,
  },
})

const BookingTR = t.intersection([InviteTR, t.type({
  date: t.union([t.string, t.null]),
  timezone: t.union([t.string, t.null]),
  cancellationLeadTime: t.union([t.number, t.null]),
  reason: t.union([t.string, t.null]),
})])
const fetchBookingsResponseTR = t.type({
  list: t.array(BookingTR),
})
export const FETCH_BOOKINGS = 'bookings/FETCH'
export type Booking = t.TypeOf<typeof BookingTR>
export type FetchBookingsResponse = t.TypeOf<typeof fetchBookingsResponseTR>
export const fetchBookings = ():ApiAction<FetchBookingsResponse> => ({
  type: FETCH_BOOKINGS,
  request: {
    typedResponse: fetchBookingsResponseTR,
    url: '/workshop_bookings',
    loader: true,
  },
})

const fetchSingleInviteResponseTR = t.type({
  id: t.number,
  title: t.string,
  description: t.string,
  allowLanguagePreference: t.boolean,
  allowedLanguages: t.array(t.string),
  availableDates: t.array(
    t.type({
      id: t.number,
      date: t.string,
    }),
  ),
  timezone: t.union([t.string, t.null]),
  duration: t.union([t.number, t.null]),
  allowNeurodiversityOption: t.boolean,
  cancellationLeadTime: t.union([t.number, t.null]),
  rescheduleLeadTime: t.union([t.number, t.null]),
})
export const FETCH_SINGLE_INVITE = 'invites/FETCH_SINGLE'
export type SingleInvite = t.TypeOf<typeof fetchSingleInviteResponseTR>
export const fetchInvite = (id: string):ApiAction<SingleInvite> => ({
  type: FETCH_SINGLE_INVITE,
  request: {
    url: `/workshop_invites/${id}/fetch_invite`,
    typedResponse: fetchSingleInviteResponseTR,
    loader: true,
  },
})

const fetchSingleBookingResponseTR = t.intersection([fetchSingleInviteResponseTR, t.type(
  {
    workshopId: t.union([t.number, t.null]),
    neurodivergent: t.union([t.boolean, t.null]),
    neurodivergentComments: t.union([t.string, t.null]),
    bookedDate: t.union([
      t.type({
        id: t.number,
        date: t.string,
      }), t.null]),
    status: t.string,
    preferredLanguage: t.union([t.string, t.null]),
  },
)])
export const FETCH_SINGLE_BOOKING = 'bookings/FETCH_SINGLE'
export type SingleBooking = t.TypeOf<typeof fetchSingleBookingResponseTR>
export const fetchBooking = (id: string):ApiAction<SingleBooking> => ({
  type: FETCH_SINGLE_BOOKING,
  request: {
    url: `/workshop_invites/${id}/fetch_booking`,
    typedResponse: fetchSingleBookingResponseTR,
    loader: true,
  },
})

const bookSlotResponseTR = t.string
export const BOOK_SLOT = 'bookings/BOOK_SLOT'
export type BookSlotResponse = t.TypeOf<typeof bookSlotResponseTR>
export const bookSlot = (id: string, body: {}):ApiAction<BookSlotResponse> => ({
  type: BOOK_SLOT,
  request: {
    url: `/workshop_invites/${id}/book`,
    typedResponse: bookSlotResponseTR,
    loader: true,
    method: 'POST',
    body,
  },
})

export const CANCEL_BOOKING = 'bookings/CANCEL_BOOKING'
export const cancelBooking = (
  id: string,
  workshopId: number,
):ApiAction<{}> => ({
  type: CANCEL_BOOKING,
  request: {
    url: `/workshop_invites/${id}/cancel_or_request_cancellation`,
    loader: true,
    method: 'POST',
    body: {
      workshopId,
      status: 'cancelled',
    },
  },
})

export const REQUEST_CANCEL_BOOKING = 'bookings/REQUEST_CANCEL_BOOKING'
export const requestCancelBooking = (
  id: string,
  workshopId: number,
  cancelReason: string,
):ApiAction<{}> => ({
  type: REQUEST_CANCEL_BOOKING,
  request: {
    url: `/workshop_invites/${id}/cancel_or_request_cancellation`,
    loader: true,
    method: 'POST',
    body: {
      workshopId,
      reason: cancelReason,
      status: 'requested_cancellation',
    },
  },
})

type RescheduleRequestBody = {
  workshopId: number,
  newWorkshopBookingId: number,
  status: string,
  workshopSubjectDetails: {
    neurodivergent: boolean,
    neurodivergentComments: string,
    preferredLanguage: string,
  },
}
export const RESCHEDULE_BOOKING = 'bookings/RESCHEDULE_BOOKING'
export const rescheduleBooking = (
  id: string, body: RescheduleRequestBody,
):ApiAction<{}> => ({
  type: RESCHEDULE_BOOKING,
  request: {
    url: `/workshop_invites/${id}/reschedule_or_request_reschedule`,
    loader: true,
    method: 'POST',
    body,
  },
})

type RequestRescheduleRequestBody = {
  workshopId: number,
  status: string,
  reason: string,
  newWorkshopBookingId: number,
}
export const REQUEST_RESCHEDULE_BOOKING = 'bookings/REQUEST_RESCHEDULE_BOOKING'
export const requestRescheduleBooking = (
  id: string,
  body: RequestRescheduleRequestBody,
):ApiAction<{}> => ({
  type: REQUEST_RESCHEDULE_BOOKING,
  request: {
    url: `/workshop_invites/${id}/reschedule_or_request_reschedule`,
    loader: true,
    method: 'POST',
    body,
  },
})
