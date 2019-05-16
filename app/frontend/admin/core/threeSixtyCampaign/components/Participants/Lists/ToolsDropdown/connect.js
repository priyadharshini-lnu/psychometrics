import { connect } from 'react-redux'
import { reset as resetCampaign, resetAllNominations } from 'admin/core/threeSixtyCampaign/'

export default connect(
  null,
  { resetCampaign, resetAllNominations },
)
