import { connect } from 'react-redux'
import { open, close } from 'libs/survey/core/modals'

export default connect(
  state => ({
    show: state.survey.modals.defaultValue.show,
    ...state.survey.modals.defaultValue.data,
  }),
  {
    open: question => open('defaultValue', question),
    close: () => close('defaultValue'),
  },
)
