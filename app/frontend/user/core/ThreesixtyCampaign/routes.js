import Campaign, { CampaignSidebar } from './components/Campaign'
import Nomination, { NominationSidebar } from './components/Nomination'
import Evaluation, { EvaluationSidebar } from './components/Evaluation'
import Report, { ReportSidebar } from './components/Report'

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
    path: '/campaigns/:campaignId/reports/:id',
    sidebar: ReportSidebar,
    main: Report,
    exact: true,
  },
]

export default routes
