import { connect } from 'react-redux'
import {
  removeSkipLogic,
} from '~/modules/survey/core/builder/assessment/question/actions'
import { blocksWithoutDeleted } from '~/modules/survey/core/builder/assessment/selectors'

export default connect(
  ({ survey: { builder } }) => ({
    blocks: blocksWithoutDeleted(builder, builder.assessment.blocks),
  }),
  {
    removeSkipLogic,
  },
)
