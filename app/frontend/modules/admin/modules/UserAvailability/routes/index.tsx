import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./AvailabilityListing')

const routes = [
  {
    path: 'user_availabilities',
    lazy: lazyRoute(page, m => m.default),
  },
]

export default routes
