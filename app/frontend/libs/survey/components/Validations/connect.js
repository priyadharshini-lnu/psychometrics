import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import { changeValidation } from 'libs/survey/core/builder/assessment/question/actions'

export default connect(
  () => ({}),
  {
    openCustomValidation: data => openModal('customValidation', data),
    changeValidation,
  },
)
