import { connect } from 'react-redux'
import { subscribeSocket } from 'libs/survey/core/temp/socket'
import {
  addResource, saveResources, loadAssessments, changeResource,
  reorderResources,
} from 'libs/survey/core/builder/resources'

export default connect(
  ({ survey }) => ({
    assessmentId: survey.builder.assessment.id,
    loaded: survey.builder.assessment.loaded,
    socketInitialized: survey.temp.socket.initialized,
    ...survey.builder.resources,
  }),
  {
    subscribeSocket,
    addResource,
    saveResources,
    loadAssessments,
    changeResource,
    reorderResources,
  },
)
