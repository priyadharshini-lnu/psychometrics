import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

// No index route: Dashboard itself sends the bare url to the first tab this admin can open.
export const routes = [
  { path: 'preview', lazy: lazyRoute(page, m => m.Preview) },
  { path: 'initialize', lazy: lazyRoute(page, m => m.Initialize) },
  { path: 'settings', lazy: lazyRoute(page, m => m.DashboardSettings) },
  { path: 'accesssheets', lazy: lazyRoute(page, m => m.Accesssheet) },
  { path: 'accesssheet_settings', lazy: lazyRoute(page, m => m.AccesssheetSettings) },
]
