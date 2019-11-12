import { connect } from 'react-redux'
import { open, close } from 'libs/survey/core/modals'

export default connect(
  state => ({
    show: state.survey.modals.randomization.show,
    ...state.survey.modals.randomization.data,
  }),
  {
    open: question => open('randomization', question),
    close: () => close('randomization'),
  },
)
