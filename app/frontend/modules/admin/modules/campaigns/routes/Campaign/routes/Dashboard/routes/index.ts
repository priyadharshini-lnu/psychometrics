import { Settings } from './Settings'
import { Accesssheet } from './Assesssheet'
import { AccesssheetSettings } from './AccesssheetSettings'

const routes = [
  { path: '/settings', component: Settings },
  { path: '/accesssheets', component: Accesssheet },
  { path: '/accesssheet_settings', component: AccesssheetSettings },
]

export default routes
