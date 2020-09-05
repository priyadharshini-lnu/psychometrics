import IUserAssessment from '../interfaces/UserAssessment'
import User from '../interfaces/User'

const UserAssessment = {
  updateAdditionalTime: (u: User, record: IUserAssessment) => record.status === 'completed' && record.isExpired,
}

export default UserAssessment
