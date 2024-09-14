import { Settings } from './Settings'
import { Initialize } from './Initialize'
import { Accesssheet } from './Assesssheet'
import { AccesssheetSettings } from './AccesssheetSettings'
import { Preview } from './Preview'

const routes = [
  { path: '/preview', component: <Preview /> },
  { path: '/initialize', component: <Initialize /> },
  { path: '/settings', component: <Settings /> },
  { path: '/accesssheets', component: <Accesssheet /> },
  { path: '/accesssheet_settings', component: <AccesssheetSettings /> },
]

export default routes
