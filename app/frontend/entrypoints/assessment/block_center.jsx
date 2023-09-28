import ReactDOM from 'react-dom'

import BlockCenter from '~/modules/survey/containers/BlockCenterContainer'
import initSentry from '~/libs/initSentry'

initSentry()

const ID = window.blockCenterDomElementId || 'psychometrics_block_center'
ReactDOM.render(<BlockCenter />, document.getElementById(ID))
