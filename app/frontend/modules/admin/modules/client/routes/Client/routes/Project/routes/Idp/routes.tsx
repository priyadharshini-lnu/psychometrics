import IdpList from './IdpList'
import DevelopmentActionList from '~/modules/admin/modules/DevelopmentActions/components/DevelopmentActionList'
import Settings from './Settings'
import ReflectionQuestions from './ReflectionQuestions'
import InterviewQuestions from './InterviewQuestions'
import IdpDetails from './IDPDetails'


export const createRoutesBasedonPermissions = (currentUser) => {
  const routes:{
    path: string,
    component: React.ReactNode,
  }[] = []

  currentUser.permissions.accessIdpTemplates && routes.push({
    path: '/templates',
    component: <IdpList />,
  }, {
    path: '/templates/:id',
    component: <IdpDetails />,
  })
  routes.push({
    path: '/settings',
    component: <Settings />,
  })
  currentUser.permissions.accessProjectDevelopmentActions && routes.push({
    path: '/development_actions',
    component: <DevelopmentActionList />,
  })
  currentUser.permissions.accessReflectionQuestions && routes.push({
    path: '/reflection_questions',
    component: <ReflectionQuestions />,
  })
  currentUser.permissions.accessInterviewQuestions && routes.push({
    path: '/interview_questions',
    component: <InterviewQuestions />,
  })
  currentUser.permissions.manageIdpProjectSettings && routes.push({
    path: '/settings',
    component: <Settings />,
  })

  return routes
}
