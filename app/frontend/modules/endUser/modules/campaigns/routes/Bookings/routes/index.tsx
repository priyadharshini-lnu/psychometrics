import { BookingsAndInvitesList } from './BookingsAndInvitesList'
import { BookingsAndInvitesDetails } from './BookingsAndInvitesDetails'
import { BookingsSuccess } from './BookingsSuccess'

export const routes = [
  {
    path: '/',
    component: <BookingsAndInvitesList />,
  },
  {
    path: '/:inviteOrBookingId/details',
    component: <BookingsAndInvitesDetails />,
  },
  {
    path: '/:inviteOrBookingId/success',
    component: <BookingsSuccess />,
  },
]
