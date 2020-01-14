import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'

export default connect(
  state => ({
    ...state.survey.modals.pipedText.data,
  }),
  {
    close: () => close('pipedText'),
  },
)
