import { compose } from 'redux'

import withSkeleton, { connector } from './withSkeleton'

export default compose(
  connector,
  withSkeleton,
)
