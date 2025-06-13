import IdpList from './IdpList'
import DevelopmentActionList from '~/modules/admin/modules/DevelopmentActions/components/DevelopmentActionList'
import Settings from './Settings'
import ReflectionQuestions from './ReflectionQuestions'

export const routes = [
  {
    redirect: true,
    from: '/',
    to: 'templates',
  },
  {
    path: '/templates',
    component: <IdpList />,
  },
  {
    path: '/settings',
    component: <Settings />,
  },
  {
    path: '/development_actions',
    component: <DevelopmentActionList />,
  },
  {
    path: '/reflection_questions',
    component: <ReflectionQuestions />,
  },
]
