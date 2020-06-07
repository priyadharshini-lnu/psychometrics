import { compose } from 'redux'
import connect from './connect'
import withEnhancedTable from './withEnhancedTable'

export default compose(
  connect,
  withEnhancedTable,
)
