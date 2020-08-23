import { connect } from 'react-redux'
import { fetchAssessmentAndReports } from 'modules/admin/modules/campaigns/core/current'
import { openModal } from 'modules/admin/core/ui/modals'

export default connect(
  () => ({}),
  {
    fetchAssessmentAndReports,
    openModal,
  },
)
