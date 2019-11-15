import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'

export default connect(
  state => ({
    show: state.survey.modals.preview.show,
    ...state.survey.modals.preview.data,
  }),
  {
    close: () => close('preview'),
  },
)
