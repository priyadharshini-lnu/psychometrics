import withSkeleton from 'modules/admin/hoc/withSkeleton'
import EmailList from './EmailList'
import connect from './connect'

export default withSkeleton(connect(EmailList))
