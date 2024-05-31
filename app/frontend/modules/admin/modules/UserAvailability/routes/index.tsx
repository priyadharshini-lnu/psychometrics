import { lazy } from 'react'

const AvailabilityListing = lazy(() => import('~/modules/admin/modules/UserAvailability/routes/AvailabilityListing'))
const routes = [
  {
    path: '/user_availabilities',
    component: <AvailabilityListing />,
  },
]

export default routes
