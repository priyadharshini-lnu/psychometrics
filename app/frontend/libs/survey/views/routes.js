import BlockList from 'views/BlockList'
import Scorring from 'layouts/Scoring'
import ResourceManager from 'layouts/ResourceManager'

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
