import { lazy } from 'react'

const AvailabilityListing = lazy(() => import('~/modules/admin/modules/UserAvailability/routes/AvailabilityListing'))
const routes = [
  {
    path: 'user_availabilities',
    element: <AvailabilityListing />,
  },
]

export default routes
