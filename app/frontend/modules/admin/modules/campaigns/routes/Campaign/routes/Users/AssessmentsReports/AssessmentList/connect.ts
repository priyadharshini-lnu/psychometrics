import { connect, ConnectedProps } from 'react-redux'
import {
  get as getAssessments, rescoreResponse, reset, remove,
} from 'modules/admin/modules/campaigns/core/userAssessments'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/admin/core/rootReducers.ts'

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
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
