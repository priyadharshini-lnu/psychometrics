import { connect } from 'react-redux'
import { open, close } from 'libs/survey/core/modals'

export default connect(
  state => console.log(state) || ({
    show: state.survey.modals.displayLogic.show,
    ...state.survey.modals.displayLogic.data,
  }),
  {
    open: question => open('displayLogic', question),
    close: () => close('displayLogic'),
  },
)
