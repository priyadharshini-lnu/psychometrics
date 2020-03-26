import Campaign from './components/Campaign'
import CampaignList from './components/CampaignList'
import Nomination, { NominationSidebar } from './components/Nomination'
import Evaluation, { EvaluationSidebar } from './components/Evaluation'
import Report, { ReportSidebar } from './components/Report'
import Assign from './components/Assign'
import GameAssign from './components/GameAssign'

const routes = [
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
    path: '/game/assigns/:assignId',
    main: GameAssign,
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
