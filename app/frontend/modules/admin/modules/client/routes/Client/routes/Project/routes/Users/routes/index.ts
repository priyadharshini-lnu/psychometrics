import { Participants } from './Participants'
import { Assessors } from './Assessors'

export const routes = [
  { redirect: true, from: '', to: '/participants' },
  {
    path: '/participants',
    component: Participants,
  },
  {
    path: '/assessors',
    component: Assessors,
  },
]
