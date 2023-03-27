import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import AssessmentContainer from '~/modules/survey/containers/AssessmentContainer'
import initSentry from '~/libs/initSentry'
import rstore from '../../modules/survey/store'

import '~/styles/utils.less'

initSentry()

const ID = window.assessmentPreviewDomElementId || 'psychometrics_preview'
const root = document.getElementById(ID)

const {
  data, type, locales, isThreesixty, dashboardUrl, selectedLocale, isAnonymousAssessment,
  langPartial, result, agileAssetsUrl, agileAssignUrl, notAnEndPage, resultsUrl, showAsSinglePage,
  readOnly,
} = root.dataset

const props = {
  data: JSON.parse(data),
  locales: JSON.parse(locales || '{}'),
  result: JSON.parse(result || '{}'),
  type,
  isThreesixty,
  dashboardUrl,
  langPartial,
  selectedLocale,
  isAnonymousAssessment,
  rstore,
  agileAssetsUrl,
  agileAssignUrl,
  notAnEndPage,
  resultsUrl,
  showAsSinglePage,
  readOnly,
}

ReactDOM.render(
  <Provider store={rstore}>
    <Router>
      <AssessmentContainer {...props} />
    </Router>
  </Provider>, root,
)
