import { connect } from 'react-redux'
import { RootState } from '~/modules/survey/core/rootReducers'
import { getMediaResponsesByQuestionId } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { markMediaResponseAsSelected } from '~/modules/survey/core/preview/FlowProcessor/actions'

export default connect(
  ({ preview, preview: { inProgressQuestions } }: RootState, { model }: { model: { id: number } }) => ({
    inProgressQuestions,
    mediaResponses: getMediaResponsesByQuestionId(preview, model.id),
  }),
  {
    markMediaResponseAsSelected,
  },
)
