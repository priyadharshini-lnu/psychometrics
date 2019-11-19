import { connect } from 'react-redux'
import { open, close } from 'libs/survey/core/modals'
import { getTree } from 'libs/survey/core/builder/flow/selectors'

export default connect(
  state => ({
    show: state.survey.modals.flow.show,
    ...state.survey.modals.flow.data,
    tree: getTree(state),
    name: state.survey.builder.assessment.name,
  }),
  {
    close: () => close('flow'),
  },
)
