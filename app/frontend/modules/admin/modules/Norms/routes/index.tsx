import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const routes = [
  {
    path: 'norms',
    lazy: lazyRoute(page, m => m.NormsList),
  },
  {
    path: 'norms/:normId/editor',
    lazy: lazyRoute(page, m => m.NormsEditorList),
  },
]

export default routes
