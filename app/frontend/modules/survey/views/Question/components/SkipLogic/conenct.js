import { connect } from 'react-redux'
import { blocksWithoutDeleted } from 'core/builder/assessment/selectors'
import {
  removeSkipLogic,
} from 'modules/survey/core/builder/assessment/question/actions'

export default connect(
  ({ survey: { builder } }) => ({
    blocks: blocksWithoutDeleted(builder, builder.assessment.blocks),
  }),
  {
    removeSkipLogic,
  },
)
