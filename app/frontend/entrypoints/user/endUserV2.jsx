import ReactDOM from 'react-dom'
import '~/modules/endUser/styles/global.less'
import '~/styles/utils.less'
import '~/utils/axiosInterceptException'
import initSentry from '~/libs/initSentry'
import Campaigns from '~/modules/endUser/modules/campaigns/App'

initSentry()

ReactDOM.render(<Campaigns />, document.getElementById('endUserContainer'))
