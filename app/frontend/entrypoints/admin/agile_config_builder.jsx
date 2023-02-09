import ReactDOM from 'react-dom'
import AgileConfigBuilder from '~/modules/admin/modules/AgileConfigBuilder/App'
import '~/modules/admin/styles/common.less'
import initSentry from '~/libs/initSentry'

initSentry()

/* eslint no-underscore-dangle: 0 */
ReactDOM.render(<AgileConfigBuilder {...window.__PROPS__} />, document.getElementById('agile-config-builder'))
