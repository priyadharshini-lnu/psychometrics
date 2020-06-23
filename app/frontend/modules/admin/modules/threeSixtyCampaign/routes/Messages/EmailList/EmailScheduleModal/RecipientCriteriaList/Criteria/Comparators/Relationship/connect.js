import { connect } from 'react-redux'
import { getRelationships } from 'modules/admin/modules/threeSixtyCampaign/core/relationships'

export default connect(
  state => ({ relationships: getRelationships(state) }),
  null,
)
