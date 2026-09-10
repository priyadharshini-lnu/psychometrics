import { currentUserFromInitialState } from '~/components/AdminShell/currentUserDetails'
import { WORKSPACE_CATEGORY, NEW_EXPERIENCE_CONFIG_KEY } from './consts'

export const isNewExperienceEnabled = (): boolean => {
  const preferences = currentUserFromInitialState()?.preferences ?? []
  const match = preferences.find(
    p => p.category === WORKSPACE_CATEGORY && p.config_key === NEW_EXPERIENCE_CONFIG_KEY,
  )
  return match?.payload?.enabled === true
}
