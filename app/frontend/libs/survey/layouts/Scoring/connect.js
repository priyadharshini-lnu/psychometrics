import { connect } from 'react-redux'
import { subscribeSocket } from 'libs/survey/core/temp/socket'
import { factorsSelector, selectedFactor } from 'libs/survey/core/builder/factors/selectors'
import { selectFactor, saveScoring } from 'libs/survey/core/builder/factors'
import { recodingSelector } from 'core/builder/factors/selectors'

export default connect(
  ({ survey }) => ({
    assessmentId: survey.builder.assessment.id,
    loaded: survey.builder.assessment.loaded,
    socketInitialized: survey.temp.socket.initialized,
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
