import BlockList from 'views/BlockList'
import Scorring from 'layouts/Scoring'

const routes = [
  {
    path: '/assessments/:id',
    component: BlockList,
    routes: [
      { path: '/scoring', component: Scorring },
    ],
  },
]

export default routes
