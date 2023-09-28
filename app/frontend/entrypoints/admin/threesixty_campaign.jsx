import ReactDOM from 'react-dom'
import ThreeSixtyApp from '~/modules/admin/modules/threeSixtyCampaign/App'
import '~/modules/admin/styles/common.less'
import '~/styles/utils.less'

import initSentry from '~/libs/initSentry'

initSentry()

ReactDOM.render(<ThreeSixtyApp />, document.getElementById('three-sixty-container'))
