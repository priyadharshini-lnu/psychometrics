import { connect } from 'react-redux'
import { close } from 'libs/survey/core/modals'
import { allQuestions } from 'core/builder/assessment/selectors'
import { removeNormRule } from 'libs/survey/core/builder/assessment/actions'

export default connect(
  (state) => {
    const { survey: { builder: { assessment } } } = state
    return ({
      assessment,
      show: state.survey.modals.mapNorms.show,
      norms: state.survey.modals.mapNorms.data && state.survey.modals.mapNorms.data.data,
      questions: allQuestions(state.survey.builder),
    })
  },
  {
    close: () => close('mapNorms'),
    removeNormRule,
  },
)
