import { connect } from 'react-redux'
import { closeModal, getData } from 'admin/core/temp/modals'
import { allQuestions } from 'core/builder/assessment/selectors'
import { removeNormRule } from 'libs/survey/core/builder/assessment/actions'

export default connect(
  (state) => {
    const { survey: { builder: { assessment } } } = state
    return ({
      assessment,
      norms: getData(state.survey).mapNorms && getData(state.survey).mapNorms.data,
      questions: allQuestions(state.survey.builder),
    })
  },
  {
    close: () => closeModal('mapNorms'),
    removeNormRule,
  },
)
