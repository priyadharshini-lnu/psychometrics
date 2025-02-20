import { createRoot } from 'react-dom/client'
import initSentry from '~/libs/initSentry'
import IdpReport from '~/modules/idpReport'
import '~/styles/utils.less'

initSentry()

const ID = window.reportPreviewDomElementId || 'report_preview'
const root = createRoot(document.getElementById(ID))
root.render(<IdpReport />)
