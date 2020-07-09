import { connect } from 'react-redux'
import { getHighlightByType } from 'modules/survey/core/preview/FlowProcessor/selectors'
import { updateHighlight } from 'modules/survey/core/preview/FlowProcessor/actions'

export default connect(
  (state, props) => ({
    highlight: getHighlightByType(state, props.model.id, 'Question'),
  }),
  {
    updateHighlight,
  },
)
