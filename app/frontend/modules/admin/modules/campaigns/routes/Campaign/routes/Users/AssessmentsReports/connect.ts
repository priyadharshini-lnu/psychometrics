import { connect } from 'react-redux'
import { getStatusesCount } from 'modules/admin/modules/campaigns/core/userAssessments'
import {
  fetchSingle as fetchSingleUser,
  getCurrent as getCurrentUser,
} from 'modules/admin/modules/campaigns/core/users'
import { openModal } from 'modules/admin/core/ui/modals'

export default connect(
  state => ({
    user: getCurrentUser(state),
    assessmentStatuses: getStatusesCount(state),
  }),
  {
    fetchSingleUser,
    openModal,
  },
)
