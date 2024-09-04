import { connect } from 'react-redux'
import { subscribeSocket } from '~/modules/survey/core/temp/socket'
import {
  addResource, saveResources, loadAssessments, changeResource,
  reorderResources, removeResource,
} from '~/modules/survey/core/builder/resources'
import { fetch, init } from '~/modules/survey/core/builder/assessment/actions'

export default connect(
  ({ survey }) => ({
    assessmentId: survey.builder.assessment.id,
    loaded: survey.builder.assessment.loaded,
    socketInitialized: survey.ui.socket.initialized,
    ...survey.builder.resources,
  }),
  {
    subscribeSocket,
    addResource,
    saveResources,
    loadAssessments,
    changeResource,
    reorderResources,
    removeResource,
    fetch,
    init,
  },
)
