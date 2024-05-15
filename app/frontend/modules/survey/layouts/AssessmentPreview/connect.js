import { connect } from 'react-redux'

export default connect(
  ({ preview }) => ({
    end: preview.end,
    initialized: preview.initialized,
    assessmentCategory: preview.assessmentCategory,
    agileAssignUrl: preview.agileAssignUrl,
    agileAssetsUrl: preview.agileAssetsUrl,
    showSubmitPage: preview.showSubmitPage,
    started: preview.started,
    showErrorWarning: preview.showErrorWarning,
    fixedTimed: preview.fixedTimed,
    instructions: preview.instructions,
    isAnonymousAssessment: preview.isAnonymousAssessment,
    submissionInProgress: preview.submissionInProgress,
    submissionFailed: preview.submissionFailed,
    submitRequired: preview.submitRequired,
    invalidSession: preview.invalidSession,
  }),
  {
  },
)
