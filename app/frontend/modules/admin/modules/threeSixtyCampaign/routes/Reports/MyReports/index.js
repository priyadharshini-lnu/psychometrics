import withSkeleton from 'modules/admin/hoc/withSkeleton'
import MyReports from './MyReports'
import connect from './connect'

export default withSkeleton(connect(MyReports))
