import { connect } from 'react-redux'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { allQuestions } from '~/modules/survey/core/builder/assessment/selectors'
import { removeNormRule } from '~/modules/survey/core/builder/assessment/actions'

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
