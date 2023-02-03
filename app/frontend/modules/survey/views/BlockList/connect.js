import { connect } from 'react-redux'
import Block from '~/modules/survey/models/BlockSerializer'
import { blocksWithoutDeleted } from '~/modules/survey/core/builder/assessment/selectors'

export default connect(
  state => ({
    blocks: blocksWithoutDeleted(state.survey.builder, state.survey.builder.assessment.blocks).map(b => Block.wrap(b)),
  }),
  {

  },
)
