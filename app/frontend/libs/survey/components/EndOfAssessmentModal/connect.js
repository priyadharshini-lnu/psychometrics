import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
import { } from 'libs/survey/core/builder/assessment/question/actions'

export default connect(
  state => ({
    ...getData(state.survey).endOfAssessment,
  }),
  {
    close: () => closeModal('endOfAssessment'),
  },
)
