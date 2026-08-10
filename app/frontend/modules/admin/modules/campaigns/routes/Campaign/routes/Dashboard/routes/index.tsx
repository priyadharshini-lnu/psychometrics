import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const Preview = page(m => m.Preview)
const Initialize = page(m => m.Initialize)
const DashboardSettings = page(m => m.DashboardSettings)
const Accesssheet = page(m => m.Accesssheet)
const AccesssheetSettings = page(m => m.AccesssheetSettings)

// No index route: Dashboard itself sends the bare url to the first tab this admin can open.
export const routes = [
  { path: 'preview', element: <Preview /> },
  { path: 'initialize', element: <Initialize /> },
  { path: 'settings', element: <DashboardSettings /> },
  { path: 'accesssheets', element: <Accesssheet /> },
  { path: 'accesssheet_settings', element: <AccesssheetSettings /> },
]
