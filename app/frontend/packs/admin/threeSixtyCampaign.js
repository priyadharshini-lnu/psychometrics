import 'antd/dist/antd.css'
import 'admin/assets/scss/common.scss'

const myCustomContext = require.context('admin/core/threeSixtyCampaign/components', true)
const ReactRailsUJS = require('react_ujs')

ReactRailsUJS.useContext(myCustomContext)
