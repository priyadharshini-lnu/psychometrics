import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import {
  createBlock, removeBlock, addQuestion, cloneBlock, renameBlock,
  saveAsTemplate, unlinkTemplate,
} from 'libs/survey/core/builder/assessment/block/actions'
import { unselectQuestion, moveBlockDown, moveBlockUp } from 'libs/survey/core/builder/assessment/actions'

export default connect(
  () => ({}),
  {
    openRandomization: data => openModal('randomization', data),
    openCreateByTemplate: data => openModal('createByTemplate', data),
    unselectQuestion,
    createBlock,
    removeBlock,
    addQuestion,
    moveBlockDown,
    moveBlockUp,
    cloneBlock,
    renameBlock,
    saveAsTemplate,
    unlinkTemplate,
  },
)
