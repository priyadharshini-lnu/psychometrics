import { Smtp } from './Smtp'

export const routes = [
  { redirect: true, from: '', to: '/smtp' },
  {
    path: '/smtp',
    component: Smtp,
  },
]
