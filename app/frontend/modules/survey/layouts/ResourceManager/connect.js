import { connect } from 'react-redux'
import {
  addResource, saveResources, loadAssessments, changeResource,
  reorderResources, removeResource,
} from '~/modules/survey/core/builder/resources'
import { fetch, init } from '~/modules/survey/core/builder/assessment/actions'

export default connect(
  ({ survey }) => ({
    assessmentId: survey.builder.assessment.id,
    loaded: survey.builder.assessment.loaded,
    ...survey.builder.resources,
  }),
  {
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
