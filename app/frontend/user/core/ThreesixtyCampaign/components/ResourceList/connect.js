import { connect } from 'react-redux'
import { getHighlightByType } from 'libs/survey/core/preview/FlowProcessor/selectors'
import { updateHighlight } from 'libs/survey/core/preview/FlowProcessor/actions'

export default connect(
  (state, props) => ({
    highlight: getHighlightByType(state, props.resource.id, 'Question'),
  }),
  {
    updateHighlight,
  },
)
