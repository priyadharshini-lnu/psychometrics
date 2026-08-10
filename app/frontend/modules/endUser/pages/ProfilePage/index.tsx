import { FC } from 'react'
import { ProfileContent } from './ProfileContent'

// Glint page for `/profile_details` — content only; the persistent UserPage
// shell is mounted at the route seam.
export const ProfilePage: FC = () => <ProfileContent />

export default ProfilePage
