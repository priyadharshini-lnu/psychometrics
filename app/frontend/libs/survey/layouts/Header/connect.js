import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'
import { createBlock } from 'libs/survey/core/builder/assessment/block/actions'
import { trashItems } from 'core/builder/assessment/selectors'

export default connect(
  state => ({
    assessment: state.survey.builder.assessment,
    builder: state.survey.builder,
    blocks: state.survey.builder.assessment.blocks,
    flow: state.survey.builder.flow,
    trash: trashItems(state),
  }),
  {
    openFlow: data => open('flow', data),
    createBlock,
  },
)
