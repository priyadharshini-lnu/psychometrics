import { isSuperAdmin, hasGrant } from 'core/currentUser'
import IUserAssessment from '../interfaces/UserAssessment'
import User from '../interfaces/User'

const UserAssessment = {
  updateAdditionalTime: (u: User, record: IUserAssessment) => (
    ['completed', 'timed_out'].includes(record.status) && record.isExpired
  ),
  resetResults: (currentUser: User, record: IUserAssessment) => {
    const superAdminOrHasGrant = isSuperAdmin(currentUser) || hasGrant(currentUser, 'assessments', 'view')
    return superAdminOrHasGrant && record.status !== 'not_started' && !record.isExternal
  },
}

export default UserAssessment
