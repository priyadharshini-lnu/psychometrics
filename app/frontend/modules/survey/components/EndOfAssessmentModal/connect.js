import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/ui/modals'
import { } from 'modules/survey/core/builder/assessment/question/actions'

export default connect(
  state => ({
    ...getData(state.survey).endOfAssessment,
  }),
  {
    close: () => closeModal('endOfAssessment'),
  },
)
