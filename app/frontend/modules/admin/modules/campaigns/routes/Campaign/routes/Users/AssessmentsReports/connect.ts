import { connect, ConnectedProps } from 'react-redux'
import { getStatusesCount } from 'modules/admin/modules/campaigns/core/userAssessments'
import {
  fetchSingle as fetchSingleUser,
  getCurrent as getCurrentUser,
  remove,
} from 'modules/admin/modules/campaigns/core/users'
import { regenerateReports, getSelectedIds, REGENERATE_REPORTS } from 'modules/admin/modules/campaigns/core/userReports'
import { openModal } from 'modules/admin/core/ui/modals'
import { RootState } from 'modules/admin/core/rootReducers'
import { isRequestInProgress } from 'modules/admin/core/request'

const connecter = connect(
  (state: RootState) => ({
    user: getCurrentUser(state),
    assessmentStatuses: getStatusesCount(state),
    selectedIds: getSelectedIds(state),
    regenerateInProgress: isRequestInProgress(state, REGENERATE_REPORTS),
  }),
  {
    fetchSingleUser,
    openModal,
    remove,
    regenerateReports,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
