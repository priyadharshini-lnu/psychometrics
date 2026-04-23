import { RouteObject } from 'react-router-dom'
import QuestionCenter from './routes/QuestionCenter'

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
