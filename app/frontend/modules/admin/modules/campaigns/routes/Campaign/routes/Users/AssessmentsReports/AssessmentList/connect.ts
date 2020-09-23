import { connect, ConnectedProps } from 'react-redux'
import { get as getAssessments, rescoreResponse, remove } from 'modules/admin/modules/campaigns/core/userAssessments'
import { get as getReports } from 'modules/admin/modules/campaigns/core/userReports'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/admin/core/rootReducers.ts'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    reports: getReports(state).list,
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
