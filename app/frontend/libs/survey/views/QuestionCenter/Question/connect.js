import { connect } from 'react-redux'
import { selectQuestion, unselectQuestion } from 'libs/survey/core/builder/assessment/actions'
import { addNote, renameQuestion } from 'libs/survey/core/builder/assessment/question/actions'

import { openModal } from 'modules/admin/core/temp/modals'
import ModuleConfigs from 'libs/survey/constants/ModuleConfigs'

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
