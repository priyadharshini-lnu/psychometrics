import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'
import { routes as idpRoutes } from './Idp/routes'
import { routes as settingsRoutes } from './Settings/routes'
import { routes as taxonomyRoutes } from './Taxonomy/routes'
import { routes as userRoutes } from './Users/routes'

const page = lazyPages('client', () => import('~/modules/admin/modules/client/pages'))
const campaignPage = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const CampaignList = campaignPage(m => m.CampaignList)
const ProjectAdmins = page(m => m.ProjectAdmins)
const ProjectUsers = page(m => m.ProjectUsers)
const ProjectDatasheet = page(m => m.ProjectDatasheet)
const ProjectSettings = page(m => m.ProjectSettings)
const ProjectDataExports = page(m => m.ProjectDataExports)
const ProjectIdp = page(m => m.ProjectIdp)
const ProjectTaxonomy = page(m => m.ProjectTaxonomy)
const ProjectLicenseList = page(m => m.ProjectLicenseList)

export const routes = [
  { index: true, element: <Navigate to="new_campaigns" replace /> },
  { path: 'new_campaigns', element: <CampaignList /> },
  { path: 'admins', element: <ProjectAdmins /> },
  { path: 'users', element: <ProjectUsers />, children: userRoutes },
  { path: 'datasheet', element: <ProjectDatasheet /> },
  { path: 'settings', element: <ProjectSettings />, children: settingsRoutes },
  { path: 'audit_reports', element: <ProjectDataExports /> },
  { path: 'idp', element: <ProjectIdp />, children: idpRoutes },
  { path: 'taxonomy', element: <ProjectTaxonomy />, children: taxonomyRoutes },
  { path: 'licenses', element: <ProjectLicenseList /> },
]
