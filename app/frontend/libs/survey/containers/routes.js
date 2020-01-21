
import Dashboard from 'layouts/Dashboard'
import Scorring from 'layouts/Scoring'

const routes = [
  {
    path: '/assessments/:id',
    component: Dashboard,
  },
  { path: '/assessments/:id/scoring', component: Scorring },
]

export default routes
