import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { allQuestions } from 'core/builder/assessment/selectors'
import { addNormRule, removeNormRule } from 'libs/survey/core/builder/assessment/actions'

export default connect(
  (state) => {
    const { survey: { builder: { assessment } } } = state
    return ({
      assessment,
      show: state.survey.modals.mapNorms.show,
      norms: assessment.norm_rules,
      questions: allQuestions(state.survey.builder),
    })
  },
  {
    close: () => close('mapNorms'),
    addNormRule,
    removeNormRule,
  },
)
