import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('developmentActions', () => import('../components/DevelopmentActionList'))

const DevelopmentActionList = page(m => m.default)

const DevelopmentActionRoutes = [
  {
    path: 'development_actions/*',
    element: <DevelopmentActionList />,
  },
]

export default DevelopmentActionRoutes
