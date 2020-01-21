import { connect } from 'react-redux'
import { selectQuestion, unselectQuestion } from 'libs/survey/core/builder/assessment/actions'
import { openModal } from 'admin/core/temp/modals'
import { createBlock, renameBlock } from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  ({ survey: { builder: { assessment: { timestamp, propPanel } } } }) => ({
    selectedModel: propPanel.question,
    timestamp, // NOTE: @fedor used to fake update
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    openDisplayLogic: data => openModal('displayLogic', data),
    openDefaultValue: data => openModal('defaultValue', data),
    openRandomization: data => openModal('randomization', data),
    openCreateByTemplate: data => openModal('createByTemplate', data),
    createBlock,
    renameBlock,
  },
)
