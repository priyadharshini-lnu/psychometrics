import IUserAssessment from '../interfaces/UserAssessment'
import User from '../interfaces/User'

const UserAssessment = {
  updateAdditionalTime: (u: User, record: IUserAssessment) => record.status === 'completed' && record.isExpired,
  resetResults: (u: User, record: IUserAssessment) => record.status !== 'not_started' && !record.isExternal,
}

export default UserAssessment
