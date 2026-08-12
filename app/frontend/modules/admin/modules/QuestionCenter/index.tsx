import { RouteObject } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./routes/QuestionCenter')

const routes: RouteObject[] = [
  {
    path: 'templates/questions',
    lazy: lazyRoute(page, m => m.default),
  },
  {
    path: 'templates/blocks',
    lazy: lazyRoute(page, m => m.default),
  },
]

export default routes
