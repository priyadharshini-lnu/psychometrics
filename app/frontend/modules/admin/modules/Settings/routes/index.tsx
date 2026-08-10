import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('settings', () => import('./Maintenance'))

const Maintenance = page(m => m.default)

const SettingsRoutes = [
  {
    path: 'settings',
    children: [
      { index: true, element: <Navigate to="maintenance" replace /> },
      { path: 'maintenance', element: <Maintenance /> },
    ],
  },
]

export default SettingsRoutes
