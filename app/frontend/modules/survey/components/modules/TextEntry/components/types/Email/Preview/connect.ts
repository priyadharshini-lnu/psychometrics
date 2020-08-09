import { connect } from 'react-redux'
import { addQuestionError, removeQuestionError } from 'modules/survey/core/preview/FlowProcessor/actions'
import { getQuestionErrors } from 'core/preview/FlowProcessor/selectors'
import { RootState } from 'modules/survey/core/rootReducers'
import { Question } from '../interfaces'

interface OwnProps {
  model: Question
}

export default connect(
  ({ preview }: RootState, { model }: OwnProps) => ({
    errors: getQuestionErrors(preview, model.id),
  }),
  {
    addQuestionError,
    removeQuestionError,
  },
)
