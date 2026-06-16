import { Smtp } from './Smtp'
import { SamlTabbed } from './Saml'
import { Integrations } from './Integrations'
import { General } from './General'
import { Webhooks } from './Webhooks'
import { Design } from './Design'
import { Profile } from './Profile'
import { SecuritySettings } from './Security'
import { Privacy } from './Privacy'
import { Registration } from './Registration'
import { Assessments } from './Assessments'
import { MettlScheduleRecords } from './MettlScheduleRecords'
import { Features } from './Features'
import { Applications, ApplicationDetails } from './Applications'

export const routes = [
  {
    path: '/smtp',
    component: <Smtp />,
  },
  {
    path: '/saml',
    component: <SamlTabbed />,
  },
  {
    path: '/integrations',
    component: <Integrations />,
  },
  {
    path: 'integrations/mettl_schedule_records',
    component: <MettlScheduleRecords />,
  },
  {
    path: '/security',
    component: <SecuritySettings />,
  },
  {
    path: '/general',
    component: <General />,
  },
  {
    path: '/webhooks',
    component: <Webhooks />,
  },

  {
    path: '/design',
    component: <Design />,
  },
  {
    path: '/profile',
    component: <Profile />,
  },
  {
    path: '/registration',
    component: <Registration />,
  },
  {
    path: '/privacy',
    component: <Privacy />,
  },
  {
    path: '/assessments',
    component: <Assessments />,
  },
  {
    path: '/features',
    component: <Features />,
  },
  {
    path: '/applications',
    component: <Applications />,
  },
  {
    path: '/applications/:applicationId',
    component: <ApplicationDetails />,
  },
  {
    path: '/applications/:applicationId/*',
    component: <ApplicationDetails />,
  },
]
