import ReactDOM from 'react-dom'
import ReportBuilder from '~/modules/reports'
import initSentry from '~/libs/initSentry'

import '~/styles/utils.less'

initSentry()

const ID = window.reportDomElementId || 'psychometrics_report_root'
ReactDOM.render(<ReportBuilder />, document.getElementById(ID))
