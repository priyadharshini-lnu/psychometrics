import { compose } from 'redux'
import connect from './connect'
import withSkeleton from './withSkeleton'

export default compose(
  connect,
  withSkeleton,
)
