import { isSuperAdmin } from 'core/currentUser'
import User from '../interfaces/User'

const Assessor = {
  loginAs: (currentUser: User) => {
    if (isSuperAdmin(currentUser)) return true

    return false
  },
}

export default Assessor
