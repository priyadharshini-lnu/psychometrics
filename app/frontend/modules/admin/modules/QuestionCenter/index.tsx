import { RouteObject } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('questionCenter', () => import('./routes/QuestionCenter'))

const QuestionCenter = page(m => m.default)

const routes: RouteObject[] = [
  {
    path: 'templates/questions',
    element: <QuestionCenter />,
  },
  {
    path: 'templates/blocks',
    element: <QuestionCenter />,
  },
]

export default routes
