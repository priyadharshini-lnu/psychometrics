import { connect } from 'react-redux'
import { isRequestInProgress } from '~/core/request'
import {
  fetch,
  remove,
  toggleActive,
  get as getUsers,
  exportCompletionStatuses,
  exportCompactCompletionStatuses,
  exportUsers,
  exportReportsAndAssessments,
  FETCH,
} from '~/modules/admin/modules/campaigns/core/users'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isSuperAdmin } from '~/core/currentUser'

const connecter = connect(
  (state: RootState) => ({
    users: getUsers(state),
    isSuperAdmin: isSuperAdmin(state.currentUser),
    isLoadingUsers: isRequestInProgress(state, FETCH),
  }),
  {
    fetch,
    remove,
    openModal,
    toggleActive,
    exportCompletionStatuses,
    exportCompactCompletionStatuses,
    exportUsers,
    exportReportsAndAssessments,
  },
)
export default connecter
