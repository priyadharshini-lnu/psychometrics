import { lazy } from 'react'

const CampaignTemplateList = lazy(() => import('./CampaignTemplateList'))

const CampaignTemplateRoutes = [
  {
    path: 'campaign_templates/*',
    element: <CampaignTemplateList />,
  },
]

export default CampaignTemplateRoutes
