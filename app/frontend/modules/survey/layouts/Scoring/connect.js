import { connect } from 'react-redux'
import { subscribeSocket } from 'modules/survey/core/temp/socket'
import { factorsSelector, selectedFactor } from 'modules/survey/core/builder/factors/selectors'
import { selectFactor, saveScoring } from 'modules/survey/core/builder/factors'
import { recodingSelector } from 'core/builder/factors/selectors'

export default connect(
  ({ survey }) => ({
    assessmentId: survey.builder.assessment.id,
    loaded: survey.builder.assessment.loaded,
    socketInitialized: survey.ui.socket.initialized,
    factors: factorsSelector(survey.builder.factors, survey.builder.assessment.factors),
    recoding: recodingSelector(survey.builder),
    selectedFactor: selectedFactor(survey.builder, survey.builder.factors.current),
  }),
  {
    subscribeSocket,
    selectFactor,
    saveScoring,
  },
)
