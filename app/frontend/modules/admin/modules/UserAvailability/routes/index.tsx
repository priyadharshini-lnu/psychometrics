import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('userAvailability', () => import('./AvailabilityListing'))

const AvailabilityListing = page(m => m.default)

const routes = [
  {
    path: 'user_availabilities',
    element: <AvailabilityListing />,
  },
]

export default routes
