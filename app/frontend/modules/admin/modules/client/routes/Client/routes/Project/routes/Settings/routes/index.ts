import { Smtp } from './Smtp'
import { Saml } from './Saml'
import { Integrations } from './Integrations'
import { General } from './General'
import { Webhooks } from './Webhooks'
import { Design } from './Design'
import { SecuritySettings } from './Security'

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
    path: '/integrations',
    component: Integrations,
  },
  {
    path: '/security',
    component: SecuritySettings,
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
