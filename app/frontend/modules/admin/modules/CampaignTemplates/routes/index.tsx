import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const CampaignTemplateList = lazy(() => import('./CampaignTemplateList'))

export const routes = [
  {
    path: '',
    component: <CampaignTemplateList />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const CampaignTemplateRoutes = [
  {
    path: '/campaign_templates/*',
    component: <Layout />,
  },
]

export default CampaignTemplateRoutes
