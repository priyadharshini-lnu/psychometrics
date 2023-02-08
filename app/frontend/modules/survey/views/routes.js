import BlockList from '~/modules/survey/views/BlockList'
import Scorring from '~/modules/survey/layouts/Scoring'
import ResourceManager from '~/modules/survey/layouts/ResourceManager'

const routes = [
  {
    path: '/assessments/:id',
    component: BlockList,
    routes: [
      { path: '/scoring', component: Scorring },
      { path: '/resources', component: ResourceManager },
    ],
  },
]

export default routes
