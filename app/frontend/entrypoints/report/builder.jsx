import { createRoot } from 'react-dom/client'
import ReportBuilder from '~/modules/reports'
import initSentry from '~/libs/initSentry'

import '~/styles/utils.less'

initSentry()

const ID = window.reportDomElementId || 'psychometrics_report_root'
const root = createRoot(document.getElementById(ID))
root.render(<ReportBuilder />)
