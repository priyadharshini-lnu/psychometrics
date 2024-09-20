import { createRoot } from 'react-dom/client'

import QuestionCenterContainer from '~/modules/survey/containers/QuestionCenterContainer'
import initSentry from '~/libs/initSentry'
import '~/styles/utils.less'

initSentry()

const ID = window.questionCenterDomElementId || 'psychometrics_question_center'
const root = createRoot(document.getElementById(ID))
root.render(<QuestionCenterContainer />)
