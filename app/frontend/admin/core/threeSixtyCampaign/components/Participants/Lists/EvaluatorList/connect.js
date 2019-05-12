import { connect } from 'react-redux'
import { fetchEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  ({ threeSixtyCampaign: { evaluators: { list } } }) => ({ evaluators: list }),
  { fetchEvaluators, openModal },
)
