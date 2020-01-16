import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { allQuestions } from 'core/builder/assessment/selectors'
import { addNormRule, removeNormRule } from 'libs/survey/core/builder/assessment/actions'

export default connect(
  (state) => {
    const { survey: { builder: { assessment } } } = state
    return ({
      assessment,
      norms: assessment.norm_rules,
      questions: allQuestions(state.survey.builder),
    })
  },
  {
    close: () => closeModal('mapNorms'),
    addNormRule,
    removeNormRule,
  },
)
