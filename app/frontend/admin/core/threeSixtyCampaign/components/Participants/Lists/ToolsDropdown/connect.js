import { connect } from 'react-redux'
import { reset as resetCampaign, resetAllNominations } from 'admin/core/threeSixtyCampaign/'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  null,
  { resetCampaign, resetAllNominations, openModal },
)
