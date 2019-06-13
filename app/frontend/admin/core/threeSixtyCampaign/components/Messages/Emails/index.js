import withSkeleton from 'admin/core/hoc/withSkeleton'
import Emails from './Emails'
import connect from './connect'

export default withSkeleton(connect(Emails))
