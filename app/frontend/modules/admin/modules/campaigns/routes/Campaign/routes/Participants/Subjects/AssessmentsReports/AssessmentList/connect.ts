import { connect, ConnectedProps } from 'react-redux'
import {
  get as getAssessments, rescoreResponse, reset, remove, resetProgress,
  toggleRequireScheduling,
} from '~/modules/admin/modules/campaigns/core/userAssessments'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    currentUser: state.currentUser,
  }),
  {
    openModal,
    rescoreResponse,
    reset,
    remove,
    resetProgress,
    toggleRequireScheduling,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
