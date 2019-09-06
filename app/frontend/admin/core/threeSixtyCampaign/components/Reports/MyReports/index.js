import withSkeleton from 'admin/core/hoc/withSkeleton'
import MyReports from './MyReports'
import connect from './connect'

export default withSkeleton(connect(MyReports))
