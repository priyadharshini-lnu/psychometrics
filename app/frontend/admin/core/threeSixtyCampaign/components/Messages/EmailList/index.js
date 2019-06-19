import withSkeleton from 'admin/core/hoc/withSkeleton'
import EmailList from './EmailList'
import connect from './connect'

export default withSkeleton(connect(EmailList))
