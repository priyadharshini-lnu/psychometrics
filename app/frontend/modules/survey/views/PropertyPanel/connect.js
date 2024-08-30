import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'
import { selectedQuestion } from '~/modules/survey/core/builder/assessment/selectors'
import { changeType, addSkipLogic } from '~/modules/survey/core/builder/assessment/question/actions'
import { addPageBreak, copyQuestion } from '~/modules/survey/core/builder/assessment/block/actions'
import { unselectQuestion } from '~/modules/survey/core/builder/assessment/actions'

export default connect(
  (state) => {
    const { survey: { builder: { assessment: { timestamp, propPanel } }, ui } } = state
    return ({
      question: selectedQuestion(state.survey.builder, propPanel.question),
      offset: propPanel.offset,
      timestamp,
      firstBlockContentOffset: ui?.propertyPanel?.firstBlockContentOffset,
    })
  },
  {
    openDisplayLogic: data => openModal('displayLogic', data),
    openPreview: data => openModal('preview', data),
    changeType,
    addPageBreak,
    addSkipLogic,
    copyQuestion,
    unselectQuestion,
  },
)
