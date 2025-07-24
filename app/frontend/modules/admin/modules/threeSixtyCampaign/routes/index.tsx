import Participants from './Participants'
import { Admins } from './Admins'
import Datasheet from './Datasheet'
import Reports from './Reports'
import Messages from './Messages'


const routes = [
  { redirect: true, from: '', to: 'participants' },
  {
    path: 'participants/*',
    component: <Participants />,
  },
  {
    path: 'messages/*',
    component: <Messages />,
  },
  {
    path: 'admins/*',
    component: <Admins />,
  },
  {
    path: 'reports/*',
    component: <Reports />,
  },
  {
    path: 'datasheet/*',
    component: <Datasheet />,
  },
]

export default routes
