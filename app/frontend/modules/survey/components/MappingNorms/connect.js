import { connect } from 'react-redux'
import { closeModal, getData } from 'modules/admin/core/ui/modals'
import { allQuestions } from 'core/builder/assessment/selectors'
import { addNormRule, removeNormRule, changeDefaultNorm } from 'modules/survey/core/builder/assessment/actions'

export default connect(
  (state) => {
    const { survey: { builder: { assessment } } } = state
    return ({
      assessment,
      norms: assessment.norm_rules,
      defaultNormId: assessment.default_norm_id,
      normData: getData(state.survey).mapNorms && getData(state.survey).mapNorms.data,
      questions: allQuestions(state.survey.builder),
    })
  },
  {
    close: () => closeModal('mapNorms'),
    addNormRule,
    removeNormRule,
    changeDefaultNorm,
  },
)
