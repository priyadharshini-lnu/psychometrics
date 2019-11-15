import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'

export default connect(
  state => ({
    show: state.survey.modals.richEditor.show,
    ...state.survey.modals.richEditor.data,
  }),
  {
    close: () => close('richEditor'),
  },
)
