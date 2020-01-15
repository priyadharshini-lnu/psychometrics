import { connect } from 'react-redux'
import { open } from 'libs/survey/core/modals'
import { selectedQuestion } from 'core/builder/assessment/selectors'
import { changeType, addSkipLogic, addNote } from 'libs/survey/core/builder/assessment/question/actions'
import { addPageBreak, copyQuestion } from 'libs/survey/core/builder/assessment/block/actions'

export default connect(
  (state) => {
    const { survey: { builder: { assessment: { timestamp, propPanel } } } } = state
    return ({
      question: selectedQuestion(state.survey.builder, propPanel.question),
      offset: propPanel.offset,
      timestamp,
    })
  },
  {
    openDisplayLogic: data => open('displayLogic', data),
    openPreview: data => open('preview', data),
    changeType,
    addPageBreak,
    addSkipLogic,
    copyQuestion,
    addNote,
  },
)
