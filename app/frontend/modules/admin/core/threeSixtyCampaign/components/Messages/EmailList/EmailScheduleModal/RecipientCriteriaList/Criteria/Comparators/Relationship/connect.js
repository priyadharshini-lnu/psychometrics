import { connect } from 'react-redux'
import { getRelationships } from 'modules/admin/core/threeSixtyCampaign/relationships'

export default connect(
  state => ({ relationships: getRelationships(state) }),
  null,
)
