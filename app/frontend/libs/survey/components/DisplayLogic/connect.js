import { connect } from 'react-redux'
import { open, close } from 'libs/survey/core/modals'

export default connect(
  state => ({
    ...state.survey.modals.displayLogic,
  }),
  {
    open: question => open('displayLogic', question),
    close: () => close('displayLogic'),
  },
)
