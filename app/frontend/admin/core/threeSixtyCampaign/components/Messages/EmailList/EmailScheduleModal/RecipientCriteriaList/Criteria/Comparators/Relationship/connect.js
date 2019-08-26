import { connect } from 'react-redux'
import { getRelationships } from 'admin/core/threeSixtyCampaign/relationships'

export default connect(
  state => ({ relationships: getRelationships(state) }),
  null,
)
