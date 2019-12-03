import { connect } from 'react-redux'
import { selectQuestion, unselectQuestion } from 'libs/survey/core/builder/assessment/actions'
import { open } from 'libs/survey/core/modals'
import {
  insertAfter, insertBefore,
} from 'libs/survey/core/builder/assessment/question/actions'
import { removeQuestion, moveQuestionUp, moveQuestionDown } from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  ({ survey: { builder: { assessment, assessment: { timestemp, propPanel } } } }) => ({
    selectedModel: propPanel.question,
    blocksOrder: assessment.blocks,
    timestemp, // NOTE: @fedor used to fake update
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    openDisplayLogic: data => open('displayLogic', data),
    openDefaultValue: data => open('defaultValue', data),
    openRandomization: data => open('randomization', data),
    removeQuestion,
    insertAfter,
    insertBefore,
    moveQuestionUp,
    moveQuestionDown,
  },
)
