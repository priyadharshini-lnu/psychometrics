import { useSelector } from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'

export const useCurrentUser = () => {
  const currentUser = useSelector((state: RootState) => state.currentUser)

  return {
    currentUser,
    isCurrentUser: (userId: string) => currentUser?.id === userId,
  }
}
