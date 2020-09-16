import { connect, ConnectedProps } from 'react-redux'
import { get as getAssessments } from 'modules/admin/modules/campaigns/core/assessments'
import {
  activateUniversalLink, rescoreResponses, remove,
} from 'modules/admin/modules/campaigns/core/assessments/actions'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/admin/core/rootReducers.ts'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    currentUser: state.currentUser,
    reports: state.campaigns.reports.list,
  }),
  {
    openModal,
    activateUniversalLink,
    rescoreResponses,
    remove,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
