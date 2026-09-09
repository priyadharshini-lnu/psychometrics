import { connect } from 'react-redux'
import { factorsSelector, selectedFactor, recodingSelector } from '~/modules/survey/core/builder/factors/selectors'
import { selectFactor, saveScoring } from '~/modules/survey/core/builder/factors'
import { fetch, init } from '~/modules/survey/core/builder/assessment/actions'

export default connect(
  ({ survey }) => ({
    assessmentId: survey.builder.assessment.id,
    loaded: survey.builder.assessment.loaded,
    factors: factorsSelector(survey.builder.factors, survey.builder.assessment.factors),
    recoding: recodingSelector(survey.builder),
    selectedFactor: selectedFactor(survey.builder, survey.builder.factors.current),
  }),
  {
    selectFactor,
    saveScoring,
    fetch,
    init,
  },
)
