import { createRoot } from 'react-dom/client'
import '@thetalententerprise/glint/fonts.css'
import '~/modules/endUser/styles/global.less'
import '~/styles/utils.less'
import '~/utils/axiosInterceptors'
import '~/utils/fetchRequestInterceptors'
import initSentry from '~/libs/initSentry'
import Campaigns from '~/modules/endUser/modules/campaigns/App'

initSentry()
const root = createRoot(document.getElementById('endUserContainer'))
root.render(<Campaigns />)
