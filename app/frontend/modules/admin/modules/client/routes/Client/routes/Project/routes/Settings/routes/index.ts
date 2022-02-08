import { Smtp } from './Smtp'
import { Saml } from './Saml'
import { General } from './General'
import { Webhooks } from './Webhooks'
import { Design } from './Design'

export const routes = [
  {
    path: '/smtp',
    component: Smtp,
  },
  {
    path: '/saml',
    component: Saml,
  },
  {
    path: '/general',
    component: General,
  },
  {
    path: '/webhooks',
    component: Webhooks,
  },
  {
    path: '/design',
    component: Design,
  },
]
