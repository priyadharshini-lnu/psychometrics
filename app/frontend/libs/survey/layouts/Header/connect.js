import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import { createBlock } from 'libs/survey/core/builder/assessment/block/actions'
import { trashItems, blocksWithQuestions } from 'core/builder/assessment/selectors'

export default connect(
  state => ({
    assessment: state.survey.builder.assessment,
    builder: state.survey.builder,
    blocks: state.survey.builder.assessment.blocks,
    flow: state.survey.builder.flow,
    blocksWithQuestions: blocksWithQuestions(state.survey.builder, state.survey.builder.assessment.blocks),
    trash: trashItems(state),
  }),
  {
    openFlow: data => openModal('flow', data),
    openMapNorms: data => openModal('mapNorms', data),
    openCreateByTemplate: data => openModal('createByTemplate', data),
    createBlock,
  },
)
