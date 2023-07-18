import { BookingsAndInvitesList } from './BookingsAndInvitesList'
import { BookingsAndInvitesDetails } from './BookingsAndInvitesDetails'

export const routes = [
  {
    path: '/',
    component: BookingsAndInvitesList,
  },
  {
    path: '/:id/booking',
    component: BookingsAndInvitesDetails,
  },
]
