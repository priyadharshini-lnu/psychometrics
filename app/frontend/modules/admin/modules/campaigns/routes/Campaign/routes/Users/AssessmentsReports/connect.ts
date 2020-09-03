import { connect, ConnectedProps } from 'react-redux'
import { getStatusesCount } from 'modules/admin/modules/campaigns/core/userAssessments'
import {
  fetchSingle as fetchSingleUser,
  getCurrent as getCurrentUser,
  remove,
  toggleStatus,
} from 'modules/admin/modules/campaigns/core/users'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  state => ({
    user: getCurrentUser(state),
    assessmentStatuses: getStatusesCount(state),
  }),
  {
    fetchSingleUser,
    openModal,
    toggleStatus,
    remove,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
