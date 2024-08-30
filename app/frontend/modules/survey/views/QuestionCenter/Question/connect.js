import { connect } from 'react-redux'
import { selectQuestion, unselectQuestion } from '~/modules/survey/core/builder/assessment/actions'
import { renameQuestion } from '~/modules/survey/core/builder/assessment/question/actions'

import { openModal } from '~/modules/admin/core/ui/modals'
import ModuleConfigs from '~/modules/survey/constants/ModuleConfigs'

export default connect(
  ({ survey: { builder: { questionCenter: { question } } } }) => ({
    question,
    moduleConfig: ModuleConfigs[question.type],
  }),
  {
    select: selectQuestion,
    unselect: unselectQuestion,
    renameQuestion,
    openRandomization: data => openModal('randomization', data),
  },
)
