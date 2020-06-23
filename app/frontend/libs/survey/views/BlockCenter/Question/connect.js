import { connect } from 'react-redux'
import { selectQuestion, unselectQuestion } from 'libs/survey/core/builder/assessment/actions'
import { openModal } from 'modules/admin/core/temp/modals'
import { moduleConfig } from 'libs/survey/core/builder/assessment/question/selectors'
import {
  addSkipLogic, renameQuestion, saveAsTemplate, unlinkTemplate, addComment, addNote, removeComment,
} from 'libs/survey/core/builder/assessment/question/actions'
import {
  removeQuestion, moveQuestionUp, moveQuestionDown,
  insertBeforeQuestion, insertAfterQuestion,
} from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  ({ survey: { builder, builder: { assessment: { propPanel } } } }, props) => ({
    selectedModel: propPanel.question,
    moduleConfig: moduleConfig(builder, props.model.id),
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    openDisplayLogic: data => openModal('displayLogic', data),
    openDefaultValue: data => openModal('defaultValue', data),
    openRandomization: data => openModal('randomization', data),
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
