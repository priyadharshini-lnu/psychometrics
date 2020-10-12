import React from 'react'
import ReactDOM from 'react-dom'
import AssessmentContainer from 'modules/survey/containers/AssessmentContainer'
import { Provider } from 'react-redux'
import rstore from '../../modules/survey/store'
import 'modules/user/styles/ant.less'

const ID = window.assessmentPreviewDomElementId || 'psychometrics_preview'
const root = document.getElementById(ID)

const {
  data, type, locales, isThreesixty, dashboardUrl, selectedLocale, isAnonymousAssessment,
  langPartial, result, agileAssetsUrl, agileAssignUrl, notAnEndPage, resultsUrl,
} = root.dataset

const props = {
  data: JSON.parse(data),
  locales: JSON.parse(locales),
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
}

ReactDOM.render(
  <Provider store={rstore}>
    <AssessmentContainer {...props} />
  </Provider>, root,
)

if (__DEV__) {
  if (module.hot) {
    module.hot.accept()
  }
}
