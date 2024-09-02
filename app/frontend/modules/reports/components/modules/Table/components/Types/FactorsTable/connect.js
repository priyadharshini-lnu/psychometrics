import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'

export default connect(
  state => ({
    benchmarkScores: state,
  }),
  {
    openConditionModal: data => openModal('CPIFactorCondition', data),
  },
)
