import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/temp/modals'

export default connect(
  null,
  {
    openConditionModal: data => openModal('CPIFactorCondition', data),
  },
)
