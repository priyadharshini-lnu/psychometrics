import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../components/DevelopmentActionList')

const DevelopmentActionRoutes = [
  {
    path: 'development_actions/*',
    lazy: lazyRoute(page, m => m.default),
  },
]

export default DevelopmentActionRoutes
