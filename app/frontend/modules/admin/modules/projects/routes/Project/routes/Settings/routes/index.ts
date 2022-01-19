import { Smtp } from './Smtp'
import { Saml } from './Saml'

export const routes = [
  {
    path: '/smtp',
    component: Smtp,
  },
  {
    path: '/saml',
    component: Saml,
  },
]
