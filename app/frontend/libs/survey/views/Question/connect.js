import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'
import { selectQuestion, unselectQuestion } from 'libs/survey/core/builder/assessment/actions'
import { moduleConfig } from 'libs/survey/core/builder/assessment/question/selectors'
import {
  addSkipLogic, renameQuestion, saveAsTemplate, unlinkTemplate,
} from 'libs/survey/core/builder/assessment/question/actions'
import {
  removeQuestion, moveQuestionUp, moveQuestionDown,
  insertBeforeQuestion, insertAfterQuestion,

} from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  ({ survey: { builder, builder: { assessment, assessment: { timestamp, propPanel } } } }, props) => ({
    selectedModel: propPanel.question,
    blocksOrder: assessment.blocks,
    moduleConfig: moduleConfig(builder, props.model.id),
    timestamp, // NOTE: @fedor used to fake update
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    openDisplayLogic: data => open('displayLogic', data),
    openDefaultValue: data => open('defaultValue', data),
    openRandomization: data => open('randomization', data),
    removeQuestion,
    insertAfterQuestion,
    insertBeforeQuestion,
    moveQuestionUp,
    moveQuestionDown,
    addSkipLogic,
    renameQuestion,
    saveAsTemplate,
    unlinkTemplate,
  },
)
