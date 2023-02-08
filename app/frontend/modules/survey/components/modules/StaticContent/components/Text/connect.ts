import { connect } from 'react-redux'
import { getHighlightByType } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { updateHighlight } from '~/modules/survey/core/preview/FlowProcessor/actions'
import { RootState } from '~/modules/survey/core/rootReducers'
import { Question } from '~/modules/survey/core/preview/FlowProcessor/interfaces'

interface OwnProps {
  model: Question
}

export default connect(
  (state: RootState, props: OwnProps) => ({
    highlight: getHighlightByType(state, props.model.id, 'Question'),
  }),
  {
    updateHighlight,
  },
)
