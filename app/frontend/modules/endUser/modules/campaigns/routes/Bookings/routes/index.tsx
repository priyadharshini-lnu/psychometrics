import { BookingsAndInvitesList } from './BookingsAndInvitesList'
import { BookingsAndInvitesDetails } from './BookingsAndInvitesDetails'
import { BookingsSuccess } from './BookingsSuccess'

export const routes = [
  { index: true, element: <BookingsAndInvitesList /> },
  { path: ':inviteOrBookingId/details', element: <BookingsAndInvitesDetails /> },
  { path: ':inviteOrBookingId/success', element: <BookingsSuccess /> },
]
