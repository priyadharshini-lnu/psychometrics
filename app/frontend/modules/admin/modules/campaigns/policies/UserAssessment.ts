import { getIn } from 'utils/immutable'
import IUserAssessment from '../interfaces/UserAssessment'
import User from '../interfaces/User'

const isSuperAdmin = ({ role }: User) => role === 'Users::SuperAdmin'
const hasGrant = ({ grants }: User, [scope, action]: string[]) => getIn(grants, scope, []).includes(action)

const UserAssessment = {
  updateAdditionalTime: (u: User, record: IUserAssessment) => record.status === 'completed' && record.isExpired,
  resetResults: (currentUser: User, record: IUserAssessment) => {
    const superAdminOrHasGrant = isSuperAdmin(currentUser) || hasGrant(currentUser, ['assessments', 'view'])
    return superAdminOrHasGrant && record.status !== 'not_started' && !record.isExternal
  },
}

export default UserAssessment
