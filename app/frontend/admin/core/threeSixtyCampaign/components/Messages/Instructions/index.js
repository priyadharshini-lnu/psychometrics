import withSkeleton from 'admin/core/hoc/withSkeleton'
import Instructions from './Instructions'
import connect from './connect'

export default withSkeleton(connect(Instructions))
