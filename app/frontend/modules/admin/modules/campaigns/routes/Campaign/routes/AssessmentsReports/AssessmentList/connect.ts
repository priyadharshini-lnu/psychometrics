import { connect } from 'react-redux'
import { get as getAssessments } from 'modules/admin/modules/campaigns/core/assessments'
import { activateUniversalLink } from 'modules/admin/modules/campaigns/core/assessments/actions'
import { openModal } from 'modules/admin/core/ui/modals'

export default connect(
  state => ({
    assessments: getAssessments(state),
  }),
  {
    openModal,
    activateUniversalLink,
  },
)
