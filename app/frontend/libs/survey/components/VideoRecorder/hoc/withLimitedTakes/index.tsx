import { compose } from 'redux'
import connect from './connect'
import withLimitedTakes from './withLimitedTakes'

export default compose(
  connect,
  withLimitedTakes,
)
