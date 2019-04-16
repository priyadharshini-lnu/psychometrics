import { connect } from 'react-redux'
import { fetchManagers } from 'core/threeSixtyCampaign/managers'

export default connect(
  ({ threeSixtyCampaign: { managers } }) => ({ managers }),
  { fetchManagers },
)
