import { connect } from 'react-redux'
import { fetchEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'

export default connect(
  ({ threeSixtyCampaign: { evaluators: { list } } }) => ({ evaluators: list }),
  { fetchEvaluators },
)
