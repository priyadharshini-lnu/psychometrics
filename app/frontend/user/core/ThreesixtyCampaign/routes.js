import Campaign, { CampaignSidebar } from './components/Campaign'
import Nomination, { Sidebar as NominationSidebar } from './components/Nomination'
import Evaluation, { Sidebar as EvaluationSidebar } from './components/Evaluation'
import Reports, { Sidebar as ReportsSidebar } from './components/Reports'

const routes = [
  {
    path: '/campaigns/:campaignId',
    sidebar: CampaignSidebar,
    main: Campaign,
    exact: true,
  },
  {
    path: '/campaigns/:campaignId/nominations/:id',
    sidebar: NominationSidebar,
    main: Nomination,
    exact: true,
  },
  {
    path: '/campaigns/:campaignId/evaluations/:id',
    sidebar: EvaluationSidebar,
    main: Evaluation,
    exact: true,
  },
  {
    path: '/campaigns/:campaignId/reports',
    sidebar: ReportsSidebar,
    main: Reports,
    exact: true,
  },
]

export default routes
