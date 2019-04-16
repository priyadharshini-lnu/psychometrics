import { connect } from 'react-redux'
import { fetchEvaluators } from 'core/threeSixtyCampaign/evaluators'

export default connect(
  ({ threeSixtyCampaign: { evaluators } }) => ({ evaluators }),
  { fetchEvaluators },
)
