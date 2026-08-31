import { Navigate } from 'react-router-dom'
import { lazyRoute } from '~/utils/lazyRoute'
import { routes as idpRoutes } from './Idp/routes'
import { routes as settingsRoutes } from './Settings/routes'
import { routes as taxonomyRoutes } from './Taxonomy/routes'
import { routes as userRoutes } from './Users/routes'

const page = () => import('~/modules/admin/modules/client/pages')
const campaignPage = () => import('~/modules/admin/modules/campaigns/pages')

export const routes = [
  { index: true, element: <Navigate to="new_campaigns" replace /> },
  { path: 'new_campaigns', lazy: lazyRoute(campaignPage, m => m.CampaignList) },
  { path: 'admins', lazy: lazyRoute(page, m => m.ProjectAdmins) },
  { path: 'users', lazy: lazyRoute(page, m => m.ProjectUsers), children: userRoutes },
  { path: 'datasheet', lazy: lazyRoute(page, m => m.ProjectDatasheet) },
  { path: 'settings', lazy: lazyRoute(page, m => m.ProjectSettings), children: settingsRoutes },
  { path: 'audit_reports', lazy: lazyRoute(page, m => m.ProjectDataExports) },
  { path: 'idp', lazy: lazyRoute(page, m => m.ProjectIdp), children: idpRoutes },
  { path: 'taxonomy', lazy: lazyRoute(page, m => m.ProjectTaxonomy), children: taxonomyRoutes },
  { path: 'licenses', lazy: lazyRoute(page, m => m.ProjectLicenseList) },
]
