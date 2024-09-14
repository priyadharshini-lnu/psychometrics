import { createRoot } from 'react-dom/client'
import ReportPreview from '~/modules/reports/preview'
import initSentry from '~/libs/initSentry'

import '~/styles/utils.less'

initSentry()

const ID = window.reportPreviewDomElementId || 'report_preview'
const root = createRoot(document.getElementById(ID))
root.render(<ReportPreview />)
