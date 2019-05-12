import { connect } from 'react-redux'
import { fetchManagers } from 'admin/core/threeSixtyCampaign/managers'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  ({ threeSixtyCampaign: { managers } }) => ({ managers }),
  { fetchManagers, openModal },
)
