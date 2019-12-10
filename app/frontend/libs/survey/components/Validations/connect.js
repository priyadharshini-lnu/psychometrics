import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'
import { changeValidation } from 'libs/survey/core/builder/assessment/question/actions'

export default connect(
  () => ({}),
  {
    openCustomValidation: data => open('customValidation', data),
    changeValidation,
  },
)
