import { connect, ConnectedProps } from 'react-redux'
import { get as getAssessments, rescoreResponse, remove } from 'modules/admin/modules/campaigns/core/userAssessments'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/admin/core/rootReducers.ts'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    reports: state.campaigns.userReports.list,
    currentUser: state.currentUser,
  }),
  {
    openModal,
    rescoreResponse,
    remove,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
