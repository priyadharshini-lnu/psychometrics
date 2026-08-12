import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./Maintenance')

const SettingsRoutes = [
  {
    path: 'settings',
    children: [
      { index: true, element: <Navigate to="maintenance" replace /> },
      { path: 'maintenance', lazy: lazyRoute(page, m => m.default) },
    ],
  },
]

export default SettingsRoutes
