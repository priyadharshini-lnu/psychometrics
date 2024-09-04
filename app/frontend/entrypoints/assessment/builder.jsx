import { createRoot } from 'react-dom/client'
import Assessment from '~/modules/survey/containers/AppContainer'
import initSentry from '~/libs/initSentry'

import '~/styles/utils.less'

initSentry()

const ID = window.assessmentDomElementId || 'psychometrics_survey_root'
const root = createRoot(document.getElementById(ID))
root.render(<Assessment />)
