import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('campaignTemplates', () => import('./CampaignTemplateList'))

const CampaignTemplateList = page(m => m.default)

const CampaignTemplateRoutes = [
  {
    path: 'campaign_templates/*',
    element: <CampaignTemplateList />,
  },
]

export default CampaignTemplateRoutes
