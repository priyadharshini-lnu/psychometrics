import { connect } from 'react-redux'
import { fetchEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'
import { openModal } from 'admin/core/temp/modals'
import { removeUser } from 'admin/core/threeSixtyCampaign/'

export default connect(
  ({ threeSixtyCampaign: { evaluators: { list } } }) => ({ evaluators: list }),
  { fetchEvaluators, openModal, removeUser },
)
