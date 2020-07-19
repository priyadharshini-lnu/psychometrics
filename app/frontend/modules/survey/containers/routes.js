
import Dashboard from 'layouts/Dashboard'
import Scorring from 'layouts/Scoring'
import ResourceManager from 'layouts/ResourceManager'

const routes = [
  {
    path: '/assessments/:id',
    component: Dashboard,
  },
  { path: '/assessments/:id/scoring', component: Scorring },
  { path: '/assessments/:id/resources', component: ResourceManager },
]

export default routes
