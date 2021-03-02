import { isSuperAdmin, hasGrant } from 'core/currentUser'
import User from '../interfaces/User'

export const CampaignPolicy = {
  canCreate: (currentUser: User) => {
    if (isSuperAdmin(currentUser)) return true

    return hasGrant(currentUser, 'clients', 'manage')
  },
}
