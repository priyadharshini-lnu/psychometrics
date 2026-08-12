import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('./CampaignTemplateList')

const CampaignTemplateRoutes = [
  {
    path: 'campaign_templates/*',
    lazy: lazyRoute(page, m => m.default),
  },
]

export default CampaignTemplateRoutes
