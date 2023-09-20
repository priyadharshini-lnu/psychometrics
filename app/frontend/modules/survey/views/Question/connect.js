import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { selectQuestion, unselectQuestion } from '~/modules/survey/core/builder/assessment/actions'
import { moduleConfig } from '~/modules/survey/core/builder/assessment/question/selectors'
import {
  addSkipLogic, renameQuestion, saveAsTemplate, unlinkTemplate, addComment, addNote, removeComment,
} from '~/modules/survey/core/builder/assessment/question/actions'
import {
  removeQuestion, moveQuestionUp, moveQuestionDown,
  insertBeforeQuestion, insertAfterQuestion,
} from '~/modules/survey/core/builder/assessment/block/actions'

export default connect(
  ({ survey: { builder, builder: { assessment, assessment: { timestamp, propPanel } } } }, props) => ({
    selectedModel: propPanel.question,
    blocksOrder: assessment.blocks,
    moduleConfig: moduleConfig(builder, props.model.id),
    linkedAssessment: assessment.linkedAssessment,
    timestamp, // NOTE: @fedor used to fake update
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    openDisplayLogic: data => openModal('displayLogic', data),
    openDefaultValue: data => openModal('defaultValue', data),
    openRandomization: data => openModal('randomization', data),
    openLinkedAssessment: data => openModal('linkedAssessment', data),
    removeQuestion,
    insertAfterQuestion,
    insertBeforeQuestion,
    moveQuestionUp,
    moveQuestionDown,
    addSkipLogic,
    renameQuestion,
    saveAsTemplate,
    unlinkTemplate,
    addComment,
    addNote,
    removeComment,
  },
)
