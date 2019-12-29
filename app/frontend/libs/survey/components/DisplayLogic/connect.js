import { connect } from 'react-redux'
import { open, close } from 'libs/survey/core/modals'
import { saveDisplayLogic } from 'libs/survey/core/builder/assessment/question/actions'

export default connect(
  state => ({
    show: state.survey.modals.displayLogic.show,
    ...state.survey.modals.displayLogic.data,
  }),
  {
    open: question => open('displayLogic', question),
    close: () => close('displayLogic'),
    saveDisplayLogic,
  },
)
