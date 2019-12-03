import { connect } from 'react-redux'
import { blocksWithoutDeleted } from 'core/builder/assessment/selectors'
import Block from 'models/Block'

export default connect(
  state => ({
    blocks: blocksWithoutDeleted(state.survey.builder, state.survey.builder.assessment.blocks).map(b => new Block(b)),
  }),
  {

  },
)
