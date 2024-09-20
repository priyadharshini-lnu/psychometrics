import { createRoot } from 'react-dom/client'

import BlockCenter from '~/modules/survey/containers/BlockCenterContainer'
import initSentry from '~/libs/initSentry'
import '~/styles/utils.less'

initSentry()

const ID = window.blockCenterDomElementId || 'psychometrics_block_center'
const root = createRoot(document.getElementById(ID))
root.render(<BlockCenter />)
