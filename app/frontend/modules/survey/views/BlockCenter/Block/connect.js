import { connect } from 'react-redux'
import { selectBlock, questionsWithoutDeleted } from 'modules/survey/core/builder/assessment/selectors'
import { openModal } from 'modules/admin/core/temp/modals'
import { renameBlock } from 'modules/survey/core/builder/assessment/block/actions'
import BlockSerializer from 'modules/survey/models/BlockSerializer'

export default connect(
  ({ survey: { builder } }) => ({
    model: BlockSerializer.wrap(selectBlock(builder, builder.assessment.id)),
    questions: questionsWithoutDeleted(builder, selectBlock(builder, builder.assessment.id).questions),
  }),
  {
    openRandomization: data => openModal('randomization', data),
    openCreateByTemplate: data => openModal('createByTemplate', data),
    renameBlock,
  },
)
