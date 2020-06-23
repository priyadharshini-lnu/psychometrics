import { connect } from 'react-redux'
import { selectQuestion, unselectQuestion } from 'modules/survey/core/builder/assessment/actions'
import { addNote, renameQuestion } from 'modules/survey/core/builder/assessment/question/actions'

import { openModal } from 'modules/admin/core/temp/modals'
import ModuleConfigs from 'modules/survey/constants/ModuleConfigs'

export default connect(
  ({ survey: { builder: { questionCenter: { question } } } }) => ({
    question,
    moduleConfig: ModuleConfigs[question.type],
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    addNote,
    renameQuestion,
    openRandomization: data => openModal('randomization', data),
  },
)
