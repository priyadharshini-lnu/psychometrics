import Campaign from './Campaign'
import CampaignList from './CampaignList'
import Nomination, { NominationSidebar } from './Nomination'
import Evaluation, { EvaluationSidebar } from './Evaluation'
import Report, { ReportSidebar } from './Report'
import Assign from './Assign'
import AgileAssign from './AgileAssign'
import CheckingWizard from './CheckingWizard'

const routes = [
  {
    path: '/system_checks/:assessmentId/:id',
    main: CheckingWizard,
    exact: true,
  },
  {
    path: '/',
    main: CampaignList,
    exact: true,
  },
  {
    path: '/campaigns',
    main: CampaignList,
    exact: true,
  },
  {
    path: '/campaigns/:campaignId',
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
    path: '/agile/assigns/:assignId',
    main: AgileAssign,
    exact: true,
  },
  {
    path: '/assigns/:assignId/pass',
    main: Assign,
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
