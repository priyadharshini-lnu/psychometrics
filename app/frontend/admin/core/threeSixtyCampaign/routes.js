import Participants from './components/Participants'
import Messages from './components/Messages'
import Reports from './components/Reports'

const routes = [
  { redirect: true, from: '', to: '/participants/subjects' },
  { redirect: true, from: '/participants', to: '/participants/subjects' },
  {
    path: '/participants',
    component: Participants,
    routes: [
      { path: '/participants/options', component: Participants.Options },
      {
        path: '/participants',
        component: Participants.Lists,
        routes: [
          { path: '/participants/subjects', component: Participants.Lists.SubjectList },
          { path: '/participants/evaluators', component: Participants.Lists.EvaluatorList },
          { path: '/participants/managers', component: Participants.Lists.ManagerList },
        ],
      },
    ],
  },
  { path: '/messages', component: Messages },
  {
    path: '/reports/options',
    component: Reports,
    routes: [
      { path: '/reports/options', component: Reports.Options },
    ],
  },
]

export default routes
