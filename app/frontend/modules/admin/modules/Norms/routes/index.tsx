import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('norms', () => import('../pages'))

const NormsList = page(m => m.NormsList)
const NormsEditorList = page(m => m.NormsEditorList)

const routes = [
  {
    path: 'norms',
    element: <NormsList />,
  },
  {
    path: 'norms/:normId/editor',
    element: <NormsEditorList />,
  },
]

export default routes
