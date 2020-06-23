import { connect } from 'react-redux'
import { openModal } from 'modules/admin/core/temp/modals'
import { changeValidation } from 'modules/survey/core/builder/assessment/question/actions'

export default connect(
  () => ({}),
  {
    openCustomValidation: data => openModal('customValidation', data),
    changeValidation,
  },
)
