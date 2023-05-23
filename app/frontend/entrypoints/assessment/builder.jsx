import ReactDOM from 'react-dom'

import Assessment from '~/modules/survey/containers/AppContainer'
import initSentry from '~/libs/initSentry'

import '~/styles/utils.less'

initSentry()

const ID = window.assessmentDomElementId || 'psychometrics_survey_root'
ReactDOM.render(<Assessment />, document.getElementById(ID))
