
import Dashboard from '~/modules/survey/layouts/Dashboard'
import Scoring from '~/modules/survey/layouts/Scoring'
import ResourceManager from '~/modules/survey/layouts/ResourceManager'

const routes = [
  {
    path: '/assessments/:id',
    component: Dashboard,
  },
  { path: '/assessments/:id/scoring', component: Scoring },
  { path: '/assessments/:id/resources', component: ResourceManager },
]

export default routes
