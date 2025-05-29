import { createRoot } from 'react-dom/client'
import ThreeSixtyApp from '~/modules/admin/modules/threeSixtyCampaign/App'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import initSentry from '~/libs/initSentry'
import setLocale from '~/utils/setLocale'

initSentry()
setLocale()
const root = createRoot(document.getElementById('three-sixty-container'))
root.render(<ThreeSixtyApp />)
