import { Navigate } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const Subjects = page(m => m.Subjects)
const UserDetails = page(m => m.UserDetails)
const Assessors = page(m => m.Assessors)
const SmsInvites = page(m => m.SmsInvites)

export const routes = [
  { index: true, element: <Navigate to="subjects" replace /> },
  { path: 'subjects', element: <Subjects /> },
  { path: 'subjects/:id', element: <Navigate to="assessments" replace /> },
  { path: 'subjects/:id/:tab', element: <UserDetails /> },
  { path: 'assessors', element: <Assessors /> },
  { path: 'sms/:tab', element: <SmsInvites /> },
]
